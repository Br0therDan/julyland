# pash: app/api/routes/admin/users.py

import logging
from typing import Any, List, Optional

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_active_superuser
from app.core.security import get_password_hash
from app.core.config import settings

from app.exceptions.auth import EXISTING_USER, USER_NOT_FOUND
from app.models import User, Subscription
from app.schemas.token import Message
from app.schemas.user import (
    AdminUserCreate,
    AdminUserUpdate,
    UserPublic,
)
from app.utils.email.email_gen import generate_new_account_email
from app.utils.email.email_sending import send_email

logger = logging.getLogger()

router = APIRouter(dependencies=[Depends(get_current_active_superuser)])

# --------------------------------------------------------
# 관리자 전용 사용자관리 API
# --------------------------------------------------------


@router.get(
    "/user",
    response_description="User List retrieved",
    response_model=List[UserPublic],
)
async def read_users(
    app_name: Optional[str] = Query(None),
) -> List[UserPublic]:
    """
    [관리자 전용] 사용자 조회
    """
    query = {}
    if app_name:
        query["apps"] = {"$in": [app_name]}

    users = await User.find(query, fetch_links=True).to_list()
    return [UserPublic.model_validate(user.model_dump(by_alias=True)) for user in users]


@router.get(
    "/user/{user_id}",
    response_model=UserPublic,
)
async def read_user_by_id(user_id: PydanticObjectId) -> UserPublic:
    """
    특정 사용자 정보 조회
    """
    user = await User.get(user_id)
    subscriptions = await Subscription.find(Subscription.user == user).to_list()
    if not user:
        raise USER_NOT_FOUND

    return UserPublic(**user.model_dump(by_alias=True), subscriptions=subscriptions)


@router.post(
    "/user",
    response_description="New user created",
    response_model=UserPublic,
)
async def create_user(entry: AdminUserCreate) -> Any:
    """
    [관리자 전용] 사용자 생성
    """
    existing_user = await User.find_one(User.email == entry.email)
    if existing_user:
        raise EXISTING_USER
    new_user = User(
        email=entry.email,
        fullname=entry.fullname,
        provider=entry.provider,
        hashed_password=get_password_hash(entry.password),
        is_active=entry.is_active,
        is_superuser=entry.is_superuser,
    )
    await new_user.save()

    # 이메일 검증 메일 발송
    if settings.emails_enabled and entry.email:
        email_data = generate_new_account_email(
            email_to=entry.email,
            username=entry.email,
            password=entry.password,
        )
        send_email(
            email_to=new_user.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )
    return UserPublic(**new_user.model_dump(by_alias=True))


@router.patch(
    "/user/{user_id}",
    response_model=UserPublic,
)
async def update_user(
    user_id: PydanticObjectId,
    update_data: AdminUserUpdate,
) -> UserPublic:
    """
    사용자 정보 업데이트
    """
    entry = await User.get(user_id)
    if not entry:
        raise USER_NOT_FOUND
    des_body = {k: v for k, v in update_data if v is not None}
    update_query = {"$set": des_body}
    await entry.update(update_query)
    return UserPublic(**entry.model_dump(by_alias=True))


@router.delete(
    "/user/{user_id}",
    response_model=Message,
)
async def delete_user(user_id: PydanticObjectId) -> Message:
    """
    사용자 삭제
    """
    entry = await User.get(user_id)
    if not entry:
        raise USER_NOT_FOUND
    await entry.delete()
    return Message(message="사용자 계정이 삭제되었습니다.")
