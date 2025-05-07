# path: app/api/routes/users.py

import logging  # ✅ MongoDB의 정규식 연산자 사용

from typing import Any, Optional
from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_active_verified_user
from app.core.security import get_password_hash, verify_password
from app.models import User
from app.schemas.token import Message
from app.schemas.user import (
    UpdatePassword,
    UserPublic,
    UserSearchPublic,
    UserUpdateMe,
)
from app.exceptions.auth import OLD_PASSWORD_INCORRECT, USER_NOT_FOUND

logger = logging.getLogger()

router = APIRouter()

# --------------------------------------------------------
# 일반 사용자용 API
# --------------------------------------------------------


@router.get("/me", response_model=UserPublic)
async def read_user_me(
    current_user: User = Depends(get_current_active_verified_user),
) -> UserPublic:
    """
    현재 사용자 정보 조회
    """
    return UserPublic(**current_user.model_dump(by_alias=True))


@router.get(
    "/search",
    response_model=list[UserSearchPublic],
    response_description="Search users by partial email (excluding domain) or name",
    dependencies=[Depends(get_current_active_verified_user)],
)
async def search_user(
    email: Optional[str] = Query(None, min_length=2, max_length=100),
    fullname: Optional[str] = Query(None, min_length=2, max_length=100),
)-> list[UserSearchPublic]:
    """
    이메일의 로컬 부분 또는 이름의 일부로 사용자 검색 (도메인 제외)
    """
    email_local = email.split("@")[0] if email else None

    # ✅ MongoDB의 `$or` 조건을 사용하여 부분 검색 가능하도록 설정
    query = {
        "$or": [
            {"email": {"$regex": f"^{email_local}@", "$options": "i"}}
            if email_local
            else None,  # ✅ 이메일의 로컬 파트로 검색
            {"fullname": {"$regex": fullname, "$options": "i"}}
            if fullname
            else None,  # ✅ 이름 일부 포함 검색 (대소문자 구분 없음)
        ]
    }
    # ✅ `None` 값을 제외한 쿼리 구성
    query["$or"] = [q for q in query["$or"] if q]

    users = await User.find(query).to_list()
    return [UserSearchPublic(**user.model_dump(by_alias=True)) for user in users]


@router.get(
    "/{user_id}",
    response_model=UserPublic,
    dependencies=[Depends(get_current_active_verified_user)],
)
async def read_user_by_id(
    user_id: str,
):
    """
    사용자 ID로 사용자 정보 조회
    """
    user = await User.get(user_id)
    if not user:
        raise USER_NOT_FOUND
    return UserPublic(**user.model_dump(by_alias=True))


@router.get(
    "/",
    response_model=UserPublic,
    dependencies=[Depends(get_current_active_verified_user)],
)
async def read_user_by_email(
    email: str,
):
    """
    이메일로 사용자 정보 조회
    """
    user = await User.find_one({"email": email})
    if not user:
        raise USER_NOT_FOUND
    return UserPublic(**user.model_dump(by_alias=True))


@router.patch(
    "/me",
    response_model=UserPublic,
)
async def update_me(
    update_data: UserUpdateMe,
    current_user: User = Depends(get_current_active_verified_user),
):
    """
    내 정보 업데이트
    """
    entry = await User.get(current_user.id)
    if not entry:
        raise USER_NOT_FOUND
    update_fields = update_data.model_dump(exclude_unset=True)
    if update_fields:
        await entry.update({"$set": update_fields})
    return UserPublic(**entry.model_dump(by_alias=True))


@router.patch(
    "/me/password",
    response_model=Message,
)
async def update_password(
    entry: UpdatePassword,
    current_user: User = Depends(get_current_active_verified_user),
) -> Any:
    """
    내 비밀번호 변경
    """
    user = await User.get(current_user.id)
    if not user:
        raise USER_NOT_FOUND

    if not verify_password(entry.current_password, user.hashed_password):
        raise OLD_PASSWORD_INCORRECT

    user.hashed_password = get_password_hash(entry.new_password)
    await user.save()
    return Message(message="패스워드가 변경되었습니다.")


@router.delete("/me/", response_model=Message)
async def delete_me(
    current_user: User = Depends(get_current_active_verified_user),
) -> Message:
    """
    내 계정 탈퇴
    """
    user = await User.get(current_user.id)
    if not user:
        raise USER_NOT_FOUND
    await user.delete()
    return Message(message="계정이 삭제되었습니다.")
