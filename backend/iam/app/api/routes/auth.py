# path: /app/api/routes/auth.py
import logging
from typing import Annotated, Any

from fastapi import APIRouter, BackgroundTasks, Body, Cookie, Depends, Response
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import get_current_active_superuser
from app.core.security import (
    get_password_hash,
    validate_token,
    verify_password,
)
from app.core.config import settings
from app.exceptions.auth import (
    ERROR_IN_TOKEN_GENERATION,
    EXISTING_USER,
    INACTIVE_USER,
    INCORRECT_PASSWORD,
    INVALID_OR_EXPIRED_TOKEN,
    UNVERIFIED_EMAIL,
    USER_NOT_FOUND,
)
from app.models import User
from app.schemas.token import Message, NewPassword, Token
from app.schemas.user import UserPublic, UserRegister
from app.utils import (
    generate_email_token,
    generate_reset_password_email,
    generate_verification_email,
    send_email,
    verify_email_token,
)
from app.auth.authentication import authentication

logger = logging.getLogger()

router = APIRouter()


@router.post(
    "/signup",
    response_description="New user signup",
    response_model=UserPublic,
)
async def register_user(
    background_tasks: BackgroundTasks, entry: UserRegister = Body(...)
) -> UserPublic:
    """
    사용자 신규 가입
    """
    existing_entry = await User.find_one(User.email == entry.email)
    if existing_entry:
        raise EXISTING_USER

    # User 생성 (비활성화 상태로 생성)
    user = User(
        fullname=entry.fullname,
        email=entry.email,
        provider="Local",
        is_active=True,
        is_superuser=False,
        is_verified=False,
        hashed_password=get_password_hash(entry.password),
    )
    await user.save()

    # 이메일 검증 메일 발송
    if settings.emails_enabled:
        email_data = generate_verification_email(user.email)
        background_tasks.add_task(
            send_email(
                email_to=user.email,
                subject=email_data.subject,
                html_content=email_data.html_content,
            )
        )
    return UserPublic(**user.model_dump(by_alias=True))


@router.post("/verify-email")
async def verify_email(response: Response, token: str = Body(...)) -> Any:
    """
    이메일 인증
    """
    email = verify_email_token(token)
    if not email:
        raise INVALID_OR_EXPIRED_TOKEN

    # 사용자 이메일 조회
    user = await User.find_one(User.email == email)
    if not user:
        raise USER_NOT_FOUND

    # 이미 활성화된 경우 FRONTEND_HOST/main/settings 로 리다이렉트 TODO: 동작 확인 조치
    if user.is_verified:
        (RedirectResponse(f"{settings.FRONTEND_HOST}/main/settings"),)

    # 사용자 활성화
    user.is_verified = True
    await user.save()
    access_token, refresh_token = await authentication(response, user)

    return Token(
        access_token=access_token, refresh_token=refresh_token, token_type="bearer"
    )


@router.post(
    "/login/access-token",
    response_model=Token,
    response_description="OAuth2 호환 토큰 로그인, 향후 요청을 위한 액세스 토큰 받기",
    summary="OAuth2 호환 토큰 로그인, 향후 요청을 위한 액세스 토큰 받기",
)
async def login_access_token(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    """
    OAuth2 호환 토큰 로그인, 향후 요청을 위한 액세스 토큰 받기
    :param form_data: OAuth2PasswordRequestForm
    :return: Token
    """
    user = await User.find_one(User.email == form_data.username)
    if not user:
        raise USER_NOT_FOUND
    if not verify_password(form_data.password, user.hashed_password):
        raise INCORRECT_PASSWORD
    elif not user.is_active:
        raise INACTIVE_USER
    elif not user.is_verified:
        raise UNVERIFIED_EMAIL
    try:  # 인증 처리
        access_token, refresh_token = await authentication(response, user)
        return Token(
            access_token=access_token, refresh_token=refresh_token, token_type="bearer"
        )
    except Exception as e:
        logger.error(f"JWT 발급 오류: {e}")
        raise ERROR_IN_TOKEN_GENERATION


@router.post("/password-recovery/{email}")
async def recover_password(email: str) -> Message:
    """
    비밀번호 복구
    """
    user = await User.find_one(User.email == email)

    if not user:
        raise USER_NOT_FOUND
    password_reset_token = generate_email_token(email=email)
    email_data = generate_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )
    send_email(
        email_to=user.email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message=f"패스워드 복구 이메일이 '{email}'로 전송되었습니다.")


@router.post("/reset-password/")
async def reset_password(body: NewPassword) -> Message:
    """
    비밀번호 재설정
    """
    email = verify_email_token(token=body.token)
    if not email:
        raise INVALID_OR_EXPIRED_TOKEN
    user = await User.find_one(User.email == email)
    if not user:
        raise USER_NOT_FOUND
    elif not user.is_active:
        raise INACTIVE_USER

    hashed_password = get_password_hash(password=body.new_password)
    user.hashed_password = hashed_password

    await user.save()
    return Message(message="Password updated successfully")


@router.post(
    "/password-recovery-html-content/{email}",
    dependencies=[Depends(get_current_active_superuser)],
    response_class=HTMLResponse,
)
async def recover_password_html_content(email: str) -> Any:
    """
    비밀번호 복구용 HTML 콘텐츠
    :param email: 이메일
    :return: HTMLResponse
    """
    user = await User.find_one(User.email == email)

    if not user:
        raise USER_NOT_FOUND
    password_reset_token = generate_email_token(email=email)
    email_data = generate_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )

    return HTMLResponse(
        content=email_data.html_content, headers={"subject:": email_data.subject}
    )


@router.post("/refresh-token", response_model=Token)
async def refresh_token(response: Response, refresh_token: str = Cookie(...)):
    """
    Refresh token을 사용하여 새 Access Token을 발급하는 API 엔드포인트.
    """
    token_payload = validate_token(refresh_token, expected_type="refresh")

    user_id = token_payload.sub
    user = await User.get(user_id)
    if not user:
        raise USER_NOT_FOUND

    access_token = await authentication(response, user)

    return Token(access_token=access_token, token_type="bearer")


@router.post("/logout")
async def logout(response: Response):
    """
    로그아웃
    """
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "로그아웃 성공"}
