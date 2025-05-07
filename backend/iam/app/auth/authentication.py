# path: app/auth/authentication.py
import logging
from datetime import timedelta
from fastapi import Response
from app.core.security import create_access_token, create_refresh_token
from app.core.config import settings
from app.models import User, Subscription


logger = logging.getLogger(__name__)


async def authentication(response: Response, user: User) -> tuple[str, str]:
    """
    사용자 인증 처리: JWT Access/Refresh 토큰을 생성하고 HTTP Only 쿠키에 저장.
    """
    try:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        # subscriptions = await Subscription.find(
        #     {"user_id": user.id}, fetch_links=True
        # ).to_list()
        # if not subscriptions:
        #     logger.warning(f"User {user.id} has no subscriptions.")
        #     subscriptions = []

        # app_list = []

        # for subscription in subscriptions:
        #     app_list.append(subscription.app.name)

        # logger.debug(f"User {user.id} app_list: {app_list}")

        access_token = create_access_token(
            expired_delta=access_token_expires,
            subject=str(user.id),
            email=user.email,
            username=user.fullname or user.email.split("@")[0],
            apps=user.apps,
            is_superuser=user.is_superuser,
        )
        refresh_token = create_refresh_token(
            subject=str(user.id),
            expired_delta=refresh_token_expires,
        )

        # 쿠키 설정
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        )
        logger.info(f"Authentication successful for user {user.id}")
        return access_token, refresh_token

    except Exception as e:
        logger.exception(f"Authentication failed for user {user.id}: {e}")
        raise e
