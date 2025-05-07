from datetime import datetime, timedelta
import logging
from typing import List, Optional

from beanie import PydanticObjectId
from fastapi import APIRouter, Body, HTTPException, Depends, Query

from app.api.deps import get_current_active_superuser
from app.models import User, App, Subscription
from app.schemas.user import (
    SubscriptionCreate,
    SubscriptionPublic,
    SubscriptionStatus,
    SubscriptionUpdate,
)
from app.schemas.token import Message

logger = logging.getLogger()

router = APIRouter(dependencies=[Depends(get_current_active_superuser)])

# --------------------------------------------------------
# 관리자 전용 구독관리 API
# --------------------------------------------------------


@router.post(
    "/subscriptions",
    response_model=SubscriptionPublic,
)
async def create_subscription(
    obj_in: SubscriptionCreate = Body(...),
) -> SubscriptionPublic:
    """
    [관리자 전용] 특정 사용자의 구독 생성
    """
    app = await App.get(obj_in.app_id)
    if not app:
        raise HTTPException(status_code=404, detail="앱을 찾을 수 없습니다")

    user = await User.get(obj_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="사용자가 비활성 상태입니다")
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="사용자가 인증되지 않았습니다")

    existing_subscription = await Subscription.find_one(
        {"user_id": obj_in.user_id, "app_id": obj_in.app_id}
    )
    if existing_subscription:
        raise HTTPException(status_code=400, detail="이미 구독이 존재합니다")

    new_subscription = Subscription(
        user=user,
        app=app,
        status=SubscriptionStatus.ACTIVE,
        tier=obj_in.tier,
        expires_at=datetime.now() + timedelta(days=obj_in.duration_days),
    )
    user.apps.append(app.name)
    await user.save()

    await new_subscription.insert()
    return SubscriptionPublic.model_validate(new_subscription.model_dump(by_alias=True))


@router.get(
    "/subscriptions",
    response_model=List[SubscriptionPublic],
)
async def read_subscriptions(
    user_id: Optional[PydanticObjectId] = Query(None),
    app_name: Optional[str] = Query(None),
) -> List[SubscriptionPublic]:
    """
    [관리자 전용] 모든 구독 조회 (또는 특정 사용자 구독 조회)
    """
    query = {}
    if user_id:
        query["user.id"] = user_id if user_id else None

    if app_name:
        query["app.name"] = app_name if app_name else None
    subscriptions = await Subscription.find(query, fetch_links=True).to_list()
    return [
        SubscriptionPublic.model_validate(sub.model_dump(by_alias=True))
        for sub in subscriptions
    ]


@router.patch(
    "/subscriptions/{subscription_id}",
    response_model=SubscriptionPublic,
)
async def update_subscription(
    subscription_id: PydanticObjectId,
    obj_in: SubscriptionUpdate = Body(...),
) -> SubscriptionPublic:
    """
    [관리자 전용] 특정 사용자의 구독 수정
    """

    subscription = await Subscription.get(subscription_id, fetch_links=True)
    if not subscription:
        raise HTTPException(status_code=404, detail="구독을 찾을 수 없습니다")

    if obj_in.app_id:
        app = await App.get(obj_in.app_id)
        if not app:
            raise HTTPException(status_code=404, detail="앱을 찾을 수 없습니다")

    await subscription.update({"$set": obj_in.model_dump(exclude_unset=True)})
    return SubscriptionPublic.model_validate(subscription.model_dump(by_alias=True))


@router.delete(
    "/subscriptions/{subscription_id}",
    response_model=Message,
)
async def delete_subscription(
    subscription_id: PydanticObjectId,
) -> Message:
    """
    [관리자 전용] 특정 사용자의 구독 삭제
    """
    subscription = await Subscription.get(subscription_id, fetch_links=True)
    if not subscription:
        raise HTTPException(status_code=404, detail="구독을 찾을 수 없습니다")

    await subscription.delete()
    user = await User.get(subscription.user.id)
    user.apps.remove(subscription.app.name)
    await user.save()
    # 구독 삭제 후 사용자에게 알림을 보낼 수 있습니다.
    return Message(message="구독이 삭제되었습니다")
