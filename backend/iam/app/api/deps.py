# path: app/api/deps.py

import logging
from typing import Optional

from fastapi import Cookie, Depends
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from beanie import PydanticObjectId

from app.core.config import settings
from app.models.user import User
from app.schemas.token import TokenPayload
from app.exceptions.auth import (
    INACTIVE_USER,
    INVALID_CREDENTIALS,
    NO_TOKEN_PROVIDED,
    SUPERUSER_REQUIRED,
    UNVERIFIED_EMAIL,
    USER_NOT_FOUND,
    INVALID_OR_EXPIRED_TOKEN,
)

logger = logging.getLogger(__name__)

# --------------------------------------------------------
# 패스워드 기반 인증을 위한 OAuth2 설정
# --------------------------------------------------------
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login/access-token", auto_error=False
)


def get_token_from_cookie_or_header(
    token_from_cookie: Optional[str] = Cookie(None),
    token_from_header: Optional[str] = Depends(reusable_oauth2),
) -> str:
    """
    1) 쿠키에 토큰이 있으면 그걸 사용
    2) 없으면 헤더에서 토큰 추출 (Bearer)
    3) 둘 다 없으면 403 에러
    """
    if token_from_cookie:
        return token_from_cookie
    if token_from_header:
        return token_from_header
    raise NO_TOKEN_PROVIDED


async def get_current_user(
    token: str = Depends(get_token_from_cookie_or_header),
) -> User:
    """
    토큰(쿠키 또는 헤더)을 디코딩하여 현재 사용자를 반환합니다.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError) as e:
        logger.error(f"JWT 디코딩 오류: {e}")
        raise INVALID_OR_EXPIRED_TOKEN

    try:
        user_id = PydanticObjectId(str(token_data.sub))
    except Exception as e:
        logger.error(f"sub 값 변환 오류: {e}")
        raise INVALID_CREDENTIALS

    user = await User.get(user_id)
    if not user:
        raise USER_NOT_FOUND
    return user


# --------------------------------------------------------
# 활성 사용자 확인
# --------------------------------------------------------


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    현재 사용자가 활성 사용자인지 확인
    """
    if not current_user.is_active:
        raise INACTIVE_USER
    return current_user


# --------------------------------------------------------
# 이메일 검증된 활성 사용자 확인
# --------------------------------------------------------
def get_current_active_verified_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    현재 사용자가 활성 사용자이고 이메일이 확인된 사용자인지 확인
    """
    if not current_user.is_verified:
        raise UNVERIFIED_EMAIL

    # TODO: 이메일 검증 확인 API 호출
    return current_user


# --------------------------------------------------------
# 슈퍼유저 권한 검증
# --------------------------------------------------------
def get_current_active_superuser(
    current_user: User = Depends(get_current_active_verified_user),
) -> User:
    """
    현재 사용자가 슈퍼유저인지 검증
    """
    if not current_user.is_superuser:
        raise SUPERUSER_REQUIRED
    return current_user
