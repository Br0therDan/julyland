# path: app/auth/providers.py

import logging
import secrets
from typing import Optional, Union
import httpx
from httpx_oauth.clients.google import GoogleOAuth2
from httpx_oauth.clients.kakao import KakaoOAuth2
from httpx_oauth.clients.naver import NaverOAuth2

from app.core.config import settings
from app.exceptions.auth import FAILED_TO_GET_OAUTH_URL, ERROR_IN_TOKEN_GENERATION
from app.models.user import User, OAuthAccount
from app.core.security import generate_secure_password, get_password_hash
from app.utils.email.email_gen import generate_new_account_email
from app.utils.email.email_sending import send_email
from app.schemas.oauth2 import (
    BaseOAuthToken,
    GoogleToken,
    GoogleProfile,
    KakaoToken,
    KakaoProfile,
    NaverToken,
    NaverProfile,
)
from app.schemas.token import Token
from app.auth.authentication import authentication

logger = logging.getLogger(__name__)

# ---------------------------
# OAuth2 Clients
# ---------------------------
google_client = GoogleOAuth2(
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
)
kakao_client = KakaoOAuth2(
    client_id=settings.KAKAO_CLIENT_ID,
    client_secret=settings.KAKAO_CLIENT_SECRET,
)
naver_client = NaverOAuth2(
    client_id=settings.NAVER_CLIENT_ID,
    client_secret=settings.NAVER_CLIENT_SECRET,
)

AVAILABLE_PROVIDERS = {
    "google": google_client,
    "kakao": kakao_client,
    "naver": naver_client,
}


class OAuthManager:
    """
    OAuthManager 클래스를 통해
    - Provider별 authorize URL
    - Callback 시 Access Token & Profile
    - User DB 업데이트
    를 일관되게 처리.
    """

    @staticmethod
    def get_provider_client(provider: str):
        if provider not in AVAILABLE_PROVIDERS:
            raise FAILED_TO_GET_OAUTH_URL
        return AVAILABLE_PROVIDERS[provider]

    @staticmethod
    def get_redirect_uri(provider: str) -> str:
        return f"{settings.FRONTEND_HOST}/api/auth/{provider}"

    @staticmethod
    async def generate_auth_url(provider: str, state: Optional[str] = None) -> str:
        client = OAuthManager.get_provider_client(provider)

        # ✅ redirect_uri가 없으면 기본값 사용
        redirect_uri = OAuthManager.get_redirect_uri(provider)
        state = state or secrets.token_urlsafe(16)
        # Provider별 scope 설정
        scope = None
        if provider == "google":
            scope = ["openid", "email", "profile"]

        try:
            authorization_url = await client.get_authorization_url(
                redirect_uri=redirect_uri, state=state, scope=scope
            )
            return authorization_url
        except Exception as e:
            logger.error(f"{provider} Authorization URL 생성 오류: {e}")
            raise FAILED_TO_GET_OAUTH_URL

    @staticmethod
    async def get_access_token_and_profile(
        provider: str, code: str
    ) -> tuple[BaseOAuthToken, Union[GoogleProfile, KakaoProfile, NaverProfile]]:
        """
        1) Access Token 획득
        2) Provider별 Profile API 호출
        3) (token_data, profile_data) 반환
        """
        client = OAuthManager.get_provider_client(provider)
        redirect_uri = OAuthManager.get_redirect_uri(provider)

        # 1) Access Token
        try:
            token_response = await client.get_access_token(
                code=code,
                redirect_uri=redirect_uri,
            )
        except Exception as e:
            logger.error(f"{provider} 토큰 획득 오류: {e}")
            raise ValueError(f"{provider.capitalize()} 토큰 획득 실패")

        # 2) token_data & 프로필 가져오기
        token_data: BaseOAuthToken
        profile_data: Union[GoogleProfile, KakaoProfile, NaverProfile]

        async with httpx.AsyncClient() as httpc:
            if provider == "google":
                token_data = GoogleToken(**token_response)
                res = await httpc.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    params={"access_token": token_data.access_token},
                )
                res.raise_for_status()
                raw_profile = res.json()
                profile_data = GoogleProfile(**raw_profile)

            elif provider == "kakao":
                token_data = KakaoToken(**token_response)
                res = await httpc.get(
                    "https://kapi.kakao.com/v2/user/me",
                    headers={"Authorization": f"Bearer {token_data.access_token}"},
                )
                res.raise_for_status()
                raw_profile = res.json()
                profile_data = KakaoProfile(**raw_profile)

            elif provider == "naver":
                token_data = NaverToken(**token_response)
                res = await httpc.get(
                    "https://openapi.naver.com/v1/nid/me",
                    headers={"Authorization": f"Bearer {token_data.access_token}"},
                )
                res.raise_for_status()
                raw_profile = res.json()
                profile_data = NaverProfile(**raw_profile["response"])

            else:
                raise ValueError(f"Not implemented provider: {provider}")

        return token_data, profile_data

    @staticmethod
    async def upsert_oauth_user(
        provider: str,
        profile_email: str,
        profile_id: str,
        profile_image: Optional[str],
        fullname: Optional[str],
        token_data: BaseOAuthToken,
    ) -> User:
        """
        DB 갱신:
        - User 조회
        - 있으면 OAuthAccount 업데이트
        - 없으면 새 User 생성 + 이메일 전송
        """
        try:
            user = await User.find_one({"email": profile_email})
            if user:
                found_account = False
                for acc in user.oauth_accounts:
                    if acc.oauth_name == provider:
                        found_account = True
                        # 토큰 갱신
                        acc.access_token = token_data.access_token
                        acc.refresh_token = getattr(token_data, "refresh_token", None)
                        acc.expires_at = getattr(token_data, "expires_at", None)
                        acc.expired_in = getattr(token_data, "expires_in", None)

                if not found_account:
                    user.oauth_accounts.append(
                        OAuthAccount(
                            oauth_name=provider,
                            account_id=profile_id,
                            account_email=profile_email,
                            access_token=token_data.access_token,
                            refresh_token=getattr(token_data, "refresh_token", None),
                            expires_at=getattr(token_data, "expires_at", None),
                        )
                    )

                if profile_image and not user.avatar_url:
                    user.avatar_url = profile_image
                if fullname and not user.fullname:
                    user.fullname = fullname
                await user.save()

            else:
                # 신규가입
                random_password = generate_secure_password()
                hashed_pw = get_password_hash(random_password)

                new_user = User(
                    fullname=fullname or None,
                    email=profile_email,
                    is_active=True,
                    is_superuser=False,
                    is_verified=True,
                    avatar_url=profile_image,
                    hashed_password=hashed_pw,
                    oauth_accounts=[
                        OAuthAccount(
                            oauth_name=provider,
                            account_id=profile_id,
                            account_email=profile_email,
                            access_token=token_data.access_token,
                            refresh_token=getattr(token_data, "refresh_token", None),
                            expires_at=getattr(token_data, "expires_at", None),
                        )
                    ],
                )
                await new_user.save()
                user = new_user

                # 웰컴 이메일
                email_data = generate_new_account_email(
                    email_to=user.email,
                    username=user.fullname,
                    password=random_password,
                )
                send_email(
                    email_to=user.email,
                    subject=email_data.subject,
                    html_content=email_data.html_content,
                )

            return user
        except Exception as e:
            logger.error(f"User 저장/갱신 오류: {e}")
            raise ValueError("User 저장 중 오류 발생")

    @staticmethod
    async def generate_tokens(response, user: User) -> Token:
        """
        JWT 발급 로직
        """
        try:
            access_token, refresh_token = await authentication(response, user)
            return Token(
                access_token=access_token,
                refresh_token=refresh_token,
                token_type="bearer",
            )
        except Exception as e:
            logger.error(f"JWT 발급 오류: {e}")
            raise ERROR_IN_TOKEN_GENERATION
