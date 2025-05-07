# path: app/schemas/user.py
from datetime import date, datetime
from enum import Enum
from typing import List, Optional
from beanie import Link, PydanticObjectId
from pydantic import BaseModel, EmailStr, Field

from app.models import OAuthAccount
from app.models.user import Subscription
from app.schemas.app import AppPublic


# === API 응답 및 데이터 전송에 사용되는 Public 모델 ===
class UserPublic(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    fullname: Optional[str] = None
    email: EmailStr
    provider: Optional[str] = None
    avatar_url: Optional[str] = None
    mobile_phone: Optional[str] = None
    birthday: Optional[date] = None
    is_active: bool = False
    is_superuser: bool = False
    is_verified: bool = False
    last_login_at: datetime

    created_at: datetime
    updated_at: datetime

    oauth_accounts: Optional[List[OAuthAccount]] = None
    apps: Optional[List[str]] = None


    class Config:
        from_attributes = True


class UserSearchPublic(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    fullname: Optional[str] = None
    email: EmailStr

    class Config:
        from_attributes = True

# === 로컬 회원가입용 모델 ===
class UserRegister(BaseModel):
    fullname: Optional[str] = None
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=40)
    is_active: bool = False
    is_superuser: bool = False

    model_config = {
        "json_schema_extra": {
            "example": {
                "fullname": "John Doe",
                "email": "john.doe@example.com",
                "password": "strongpassword",
            }
        }
    }


# === OAuth 회원가입용 모델 ===
class UserOAuthRegister(BaseModel):
    email: EmailStr
    fullname: Optional[str] = None
    avatar_url: Optional[str] = None
    provider: str
    is_active: bool = True

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "john.doe@example.com",
                "fullname": "John Doe",
                "avatar_url": "https://example.com/picture.jpg",
                "provider": "google",
                "is_active": True,
            }
        }
    }


# === 일반 사용자가 자신의 정보를 업데이트할 때 사용하는 모델 ===
class UserUpdateMe(BaseModel):
    fullname: Optional[str] = None
    avatar_url: Optional[str] = None
    mobile_phone: Optional[str] = None
    birthday: Optional[date] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "fullname": "John Doe Updated",
                "avatar_url": "https://example.com/newpicture.jpg",
                "mobile_phone": "+821012345678",
                "birthday": "1990-01-01",
            }
        }
    }


# === 비밀번호 변경 모델 ===
class UpdatePassword(BaseModel):
    """
    본인 비밀번호 변경을 위한 모델
    """

    current_password: str = Field(..., min_length=8, max_length=40)
    new_password: str = Field(..., min_length=8, max_length=40)

    model_config = {
        "json_schema_extra": {
            "example": {
                "current_password": "oldpassword",
                "new_password": "newstrongpassword",
            }
        }
    }


# === 관리자용 사용자 생성 모델 ===
class AdminUserCreate(BaseModel):
    email: EmailStr
    fullname: Optional[str] = None
    provider: Optional[str] = "Local"
    password: str = Field(..., min_length=8, max_length=40)
    is_active: bool = True
    is_superuser: bool = False

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "admin@example.com",
                "fullname": "Admin User",
                "password": "adminpassword",
                "provider": "Local",
                "is_active": True,
                "is_superuser": False,
            }
        }
    }


# === 관리자용 사용자 업데이트 모델 ===
class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    fullname: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "updated@example.com",
                "fullname": "Updated Name",
                "password": "newpassword",
                "is_active": True,
                "is_superuser": False,
            }
        }
    }


class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    TRIAL = "trial"
    CANCELED = "canceled"
    EXPIRED = "expired"
    NONE = "none"


# 구독 티어 Enum
class SubscriptionTier(str, Enum):
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"


class SubscriptionCreate(BaseModel):
    """구독 생성 요청"""

    user_id: PydanticObjectId
    app_id: PydanticObjectId
    tier: str
    status: SubscriptionStatus = SubscriptionStatus.ACTIVE
    duration_days: int

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "user_id": "61f7b1b9c4b7e0b5a9b5f1c7",
                "app_id": "67d4204f3a969379075a9d32",
                "tier": "basic",
                "duration_days": 30,
            }
        }


class SubscriptionUpdate(BaseModel):
    """구독 업데이트 요청"""

    app_id: Optional[PydanticObjectId] = None
    tier: Optional[str]
    expires_at: Optional[datetime] = None
    status: Optional[SubscriptionStatus]

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "user_id": "61f7b1b9c4b7e0b5a9b5f1c7",
                "app_id": "67d4204f3a969379075a9d32",
                "tier": "premium",
                "duration_days": 60,
                "status": "active",
            }
        }


class SubscriptionPublic(BaseModel):
    """구독 정보 응답"""

    id: PydanticObjectId = Field(alias="_id")
    user: UserPublic
    app: AppPublic
    status: SubscriptionStatus
    tier: SubscriptionTier
    expires_at: datetime

    class Config:
        from_attributes = True
