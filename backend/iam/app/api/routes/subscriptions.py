import logging
from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId
from app.exceptions.subscription import (
    ALREADY_SUBSCRIBED,
    SUBSCRIPTION_NOT_FOUND,
    APP_NOT_FOUND,
)
from app.models.user import User, App, Subscription, SubscriptionTier
from app.services.subscription_service import (
    create_subscription,
    get_user_subscription,
    update_subscription,
    cancel_subscription,
)
from app.api.deps import get_current_active_verified_user
from app.schemas.token import Message
from app.schemas.user import (
    SubscriptionCreate,
    SubscriptionPublic,
    SubscriptionUpdate,
)
from app.schemas.app import AppPublic

logger = logging.getLogger()
router = APIRouter()


@router.post("/subscribe/", response_model=SubscriptionPublic)
async def subscribe_user(
    entry: SubscriptionCreate,
    current_user: User = Depends(get_current_active_verified_user),
):
    """유저 구독 생성 API"""
    existing_subscription = await get_user_subscription(current_user.id)
    if existing_subscription:
        raise ALREADY_SUBSCRIBED

    if entry.tier != SubscriptionTier.FREE:
        raise ValueError("무료 구독만 가능합니다.")  # TODO: 결제 API 연동

    # 구독 생성 및 DB 저장
    subscription = await create_subscription(current_user, entry)

    # 입력받은 서비스 ID 목록으로 실제 서비스 조회 (fetch_links로 확장)
    apps = await App.find({"_id": {"$in": entry.apps}}, fetch_links=True).to_list()
    if not apps:
        raise APP_NOT_FOUND

    # Subscription의 apps 필드에 조회된 서비스 목록 할당
    subscription.apps = apps
    await subscription.save()

    # 사용자(User)의 subscription 필드를 생성된 Subscription의 ID로 업데이트
    current_user.subscription = subscription.id
    await current_user.save()

    # 응답 DTO 구성: 각 서비스는 AppPublic 모델로 변환
    subscription_data = subscription.model_dump(by_alias=True)
    subscription_data["apps"] = [
        AppPublic.model_validate(app.model_dump(by_alias=True))
        for app in subscription.apps
    ]
    return SubscriptionPublic.model_validate(subscription_data)


@router.get("/", response_model=SubscriptionPublic)
async def get_subscription(user: User = Depends(get_current_active_verified_user)):
    """유저 구독 정보 조회 API"""
    subscription = await get_user_subscription(user.id)
    if not subscription:
        raise SUBSCRIPTION_NOT_FOUND

    subscription_data = subscription.model_dump(by_alias=True)
    subscription_data["apps"] = [
        AppPublic.model_validate(app.dict(by_alias=True)) for app in subscription.apps
    ]
    return SubscriptionPublic.model_validate(subscription_data)


@router.patch("/", response_model=SubscriptionPublic)
async def update_user_subscription(
    entry: SubscriptionUpdate,
    current_user: User = Depends(get_current_active_verified_user),
):
    """유저 구독 정보 수정 API"""
    subscription = await get_user_subscription(current_user.id)
    if not subscription:
        raise SUBSCRIPTION_NOT_FOUND

    subscription = await update_subscription(subscription.id, entry)
    subscription_data = subscription.model_dump(by_alias=True)
    subscription_data["apps"] = [
        AppPublic.model_validate(app.dict(by_alias=True)) for app in subscription.apps
    ]
    return SubscriptionPublic.model_validate(subscription_data)


@router.post("/cancel/", response_model=Message)
async def cancel_user_subscription(
    current_user: User = Depends(get_current_active_verified_user),
) -> Message:
    """유저 구독 취소 API"""
    subscription = await cancel_subscription(current_user)
    if not subscription:
        raise SUBSCRIPTION_NOT_FOUND

    return Message(message="구독이 취소되었습니다.")


@router.post("/{subscription_id}/apps", response_model=SubscriptionPublic)
async def add_app_to_subscription(
    subscription_id: PydanticObjectId,
    app_id: PydanticObjectId,
    current_user: User = Depends(get_current_active_verified_user),
):
    """
    특정 구독에 서비스 추가 API
    """
    subscription = await Subscription.get(subscription_id, fetch_links=True)
    if not subscription:
        raise SUBSCRIPTION_NOT_FOUND

    # 구독 소유권 체크
    if subscription.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to modify this subscription"
        )

    app = await App.get(app_id, fetch_links=True)
    if not app:
        raise APP_NOT_FOUND

    # 이미 추가된 서비스가 아니라면 추가
    if not any(s.id == app.id for s in subscription.apps if hasattr(s, "id")):
        subscription.apps.append(app)
        await subscription.save()

    subscription_data = subscription.model_dump(by_alias=True)
    subscription_data["apps"] = [
        AppPublic.model_validate(s.dict(by_alias=True)) for s in subscription.apps
    ]
    return SubscriptionPublic.model_validate(subscription_data)


@router.delete("/{subscription_id}/apps/{app_id}", response_model=SubscriptionPublic)
async def remove_app_from_subscription(
    subscription_id: PydanticObjectId,
    app_id: PydanticObjectId,
    current_user: User = Depends(get_current_active_verified_user),
):
    """
    특정 구독에서 서비스 삭제 API
    """
    subscription = await Subscription.get(subscription_id, fetch_links=True)
    if not subscription:
        raise SUBSCRIPTION_NOT_FOUND

    if subscription.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to modify this subscription"
        )

    # subscription.apps에서 app_id에 해당하는 항목을 제거
    new_apps = [s for s in subscription.apps if s.id != app_id]
    if len(new_apps) == len(subscription.apps):
        # 삭제 대상 서비스가 없는 경우
        raise APP_NOT_FOUND

    subscription.apps = new_apps
    await subscription.save()

    subscription_data = subscription.model_dump(by_alias=True)
    subscription_data["apps"] = [
        AppPublic.model_validate(s.dict(by_alias=True)) for s in subscription.apps
    ]
    return SubscriptionPublic.model_validate(subscription_data)
