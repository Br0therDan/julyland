# path: app/models/user.py

from datetime import date, datetime
from enum import Enum
from typing import List, Optional
from beanie import Document, Link, PydanticObjectId
from pydantic import Field
from pymongo import IndexModel
from pymongo.collation import Collation
from app.models.base import BaseDocument
# from app.models.subscription import Subscription


class SubscriptionStatus(str, Enum):
    ACTIVE = "active"  # 활성 구독
    TRIAL = "trial"  # 무료 체험
    CANCELED = "canceled"  # 구독 취소
    EXPIRED = "expired"  # 만료됨
    NONE = "none"  # 구독 없음


class SubscriptionTier(str, Enum):
    FREE = "free"  # 무료
    BASIC = "basic"  # 기본 구독
    PREMIUM = "premium"  # 프리미엄
    ENTERPRISE = "enterprise"  # 기업용


class Subscription(BaseDocument):
    user: Link["User"] = Field(default_factory=list)
    app: Link["App"]
    status: SubscriptionStatus = Field(default=SubscriptionStatus.NONE)
    tier: SubscriptionTier = Field(default=SubscriptionTier.FREE)
    expires_at: Optional[datetime] = Field(None)

    class Settings:
        name = "subscriptions"


class App(Document):
    name: str
    logo: str = None
    description: Optional[str] = None

    class Settings:
        name = "apps"
        indexes = [
            IndexModel(
                "name",
                name="case_insensitive_name_index",
                unique=True,
            ),
        ]


class OAuthAccount(BaseDocument):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId)
    oauth_name: str
    access_token: str
    account_id: str
    account_email: str
    expired_in: Optional[int] = None
    expires_at: Optional[int] = None
    refresh_token: Optional[str] = None

    class Settings:
        name = "oauth_accounts"


class User(BaseDocument):
    """사용자 정보"""

    email: str
    hashed_password: str
    is_active: bool = True
    is_superuser: bool = False
    is_verified: bool = False

    fullname: Optional[str] = Field(None)
    avatar_url: Optional[str] = Field(None)
    mobile_phone: Optional[str] = Field(None)
    birthday: Optional[date] = Field(None)
    last_login_at: datetime = Field(default_factory=datetime.now)

    oauth_accounts: List[OAuthAccount] = Field(default_factory=list)
    apps: List[str] = Field(default_factory=list)


    class Settings:
        name = "users"
        email_collation = Collation("en", strength=2)
        indexes = [
            IndexModel(
                "email",
                name="case_insensitive_email_index",
                collation=email_collation,
                unique=True,
            ),
        ]
