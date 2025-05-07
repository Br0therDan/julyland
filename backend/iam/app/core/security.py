# path: app/core/security.py

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
import secrets
import string
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jwt.exceptions import InvalidTokenError

from app.core.config import settings
from app.schemas.token import TokenPayload
from app.exceptions.auth import INVALID_OR_EXPIRED_TOKEN, INVALID_TOKEN_TYPE


logger = logging.getLogger()

# Argon2 해싱 도구 초기화
password_hasher = PasswordHasher()


def create_access_token(
    expired_delta: timedelta,
    subject: str | Any,
    email: str,
    username: str,
    apps: Optional[list[str]] = None,
    is_superuser: bool = False,
) -> str:
    expire = datetime.now(timezone.utc) + expired_delta
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "email": email,
        "name": username,
        "apps": apps,
        "is_superuser": is_superuser,
    }
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
        headers={"kid": "web-client-key"},
    )
    return encoded_jwt


def create_refresh_token(
    subject: str | Any,
    expired_delta: timedelta,
) -> str:
    expire = datetime.now(timezone.utc) + expired_delta
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh",
    }
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
        headers={"kid": "web-client-key"},
    )
    return encoded_jwt


def verify_password(plain_password: str, password: str) -> bool:
    """
    비밀번호 검증
    :param plain_password: 평문 비밀번호
    :param hashed_password: 해시된 비밀번호
    :return: 비밀번호 일치 여부
    """
    try:
        password_hasher.verify(password, plain_password)
        return True
    except VerifyMismatchError:
        return False


def get_password_hash(password: str) -> str:
    """
    비밀번호 해싱
    :param password: 평문 비밀번호
    :return: 해시된 비밀번호
    """
    return password_hasher.hash(password)


def generate_password_reset_token(email: str) -> str:
    delta = timedelta(hours=settings.EMAIL_TOKEN_EXPIRE_HOURS)
    now = datetime.now(timezone.utc)
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": email},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> str | None:
    try:
        decoded_token = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return str(decoded_token["sub"])
    except InvalidTokenError:
        return None


def generate_secure_password(length: int = 12) -> str:
    characters = string.ascii_letters + string.digits + string.punctuation
    password = "".join(secrets.choice(characters) for _ in range(length))
    return password


def validate_token(token: str, expected_type: str = "access") -> TokenPayload:
    """
    주어진 토큰을 검증하고, expected_type ("access" 또는 "refresh")와 일치하는지 확인합니다.
    올바른 경우 TokenPayload 인스턴스를 반환하며, 그렇지 않으면 HTTPException을 발생시킵니다.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except jwt.PyJWTError as e:
        raise INVALID_OR_EXPIRED_TOKEN from e

    if token_data.type != expected_type:
        raise INVALID_TOKEN_TYPE

    if token_data.exp < int(datetime.now(timezone.utc).timestamp()):
        raise INVALID_OR_EXPIRED_TOKEN

    return token_data
