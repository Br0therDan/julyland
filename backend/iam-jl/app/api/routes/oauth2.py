# path: app/api/routers/oauth2.py

import logging
from typing import Optional
from urllib.parse import unquote
from fastapi import APIRouter, HTTPException, Response

from app.auth.providers import (
    OAuthManager,
    FAILED_TO_GET_OAUTH_URL,
    ERROR_IN_TOKEN_GENERATION,
)
from app.schemas.token import Token

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/{provider}/authorize", response_model=str)
async def oauth_authorize(
    provider: str,
    redirect_uri: Optional[
        str
    ] = None,  # TODO: 모바일앱 구현시 필요하며, 아래 추가로직 구현 확인
    state: Optional[str] = None,
) -> str:
    """
    e.g. /api/auth/google/authorize
    """
    try:
        authorization_url = await OAuthManager.generate_auth_url(provider, state)
        return authorization_url
    except FAILED_TO_GET_OAUTH_URL:
        raise HTTPException(status_code=400, detail="OAuth URL 생성 실패")
    except Exception as e:
        logger.error(f"{provider} authorize error: {e}")
        raise HTTPException(status_code=500, detail="Unknown authorize error")


@router.get("/{provider}/callback", response_model=Token)
async def oauth_callback(
    response: Response, provider: str, code: str, state: Optional[str] = None
) -> Token:
    """
    e.g. /api/auth/google/callback
    """
    try:
        decoded_code = unquote(code)
        # (1) token, profile
        token_data, profile_data = await OAuthManager.get_access_token_and_profile(
            provider, decoded_code
        )

        # (2) upsert user
        if provider == "google":
            user = await OAuthManager.upsert_oauth_user(
                provider=provider,
                profile_email=profile_data.email,
                profile_id=profile_data.id,
                profile_image=getattr(profile_data, "picture", None),
                fullname=getattr(profile_data, "name", None),
                token_data=token_data,
            )
        elif provider == "kakao":
            user = await OAuthManager.upsert_oauth_user(
                provider=provider,
                profile_email=profile_data.kakao_account.email,
                profile_id=str(profile_data.id),
                profile_image=profile_data.kakao_account.profile.profile_image_url,
                fullname=profile_data.kakao_account.profile.nickname,
                token_data=token_data,
            )
        elif provider == "naver":
            user = await OAuthManager.upsert_oauth_user(
                provider=provider,
                profile_email=profile_data.email,
                profile_id=profile_data.id,
                profile_image=profile_data.profile_image,
                fullname=profile_data.name,
                token_data=token_data,
            )
        else:
            raise HTTPException(status_code=400, detail="Not supported provider")

        # (3) JWT 발급
        token = await OAuthManager.generate_tokens(response, user)
        return token

    except ERROR_IN_TOKEN_GENERATION:
        raise HTTPException(status_code=500, detail="토큰 발급 오류")
    except Exception as e:
        logger.error(f"{provider} callback error: {e}")
        raise HTTPException(status_code=500, detail="Callback 처리 실패")
