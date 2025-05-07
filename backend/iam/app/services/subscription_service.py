from datetime import datetime, timedelta
from beanie import PydanticObjectId
from app.models.user import User, Subscription, SubscriptionStatus
import logging
from app.schemas.user import SubscriptionCreate, SubscriptionUpdate

logger = logging.getLogger(__name__)


async def create_subscription(user: User, data: SubscriptionCreate):
    """새로운 구독 생성"""
    expires_at = datetime.now() + timedelta(days=data.duration_days)
    subscription = Subscription(
        user_id=user.id,
        apps=data.apps,  # 초기에는 서비스 ID 목록을 저장; 후에 실제 객체로 대체
        status=SubscriptionStatus.ACTIVE,
        tier=data.tier,
        expires_at=expires_at,
    )
    await subscription.insert()
    return subscription


async def get_user_subscription(user_id: PydanticObjectId):
    """사용자의 구독 정보 조회 (연결된 서비스도 확장)"""
    return await Subscription.find_one({"user_id": user_id}, fetch_links=True)


async def update_subscription(
    subscription_id: PydanticObjectId, data: SubscriptionUpdate
):
    """구독 정보 업데이트"""
    subscription = await Subscription.get(subscription_id)
    if not subscription:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(subscription, field, value)
    await subscription.save()
    return subscription


async def cancel_subscription(user: User):
    """구독 취소"""
    subscription = await get_user_subscription(user.id)
    if not subscription:
        return None
    subscription.status = SubscriptionStatus.CANCELED
    subscription.expires_at = datetime.now()
    await subscription.save()
    return subscription
