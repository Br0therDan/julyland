# path: app/utils/email_gen.py


from app.core.config import settings
from .email_sending import EmailData, render_email_template
from .email_token import generate_email_token

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()


def generate_verification_email(email_to: str) -> EmailData:
    """
    신규 가입자 검증 이메일 발송 함수
    """
    project_name = settings.PROJECT_NAME
    verification_token = generate_email_token(email_to)
    verification_link = (
        f"{settings.FRONTEND_HOST}/api/auth/verify-email?token={verification_token}"
    )

    subject = f"{project_name} - 이메일 인증 요청"
    html_content = render_email_template(
        template_name="verify_email.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "email": email_to,
            "link": verification_link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_reset_password_email(email_to: str, email: str, token: str) -> EmailData:
    """
    패스워드 리셋 이메일 생성
    """
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - 패스워드 복구 {email}"
    link = f"{settings.FRONTEND_HOST}/auth/reset-password?token={token}"
    html_content = render_email_template(
        template_name="reset_password.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": email,
            "email": email_to,
            "valid_hours": settings.EMAIL_TOKEN_EXPIRE_HOURS,
            "link": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_new_account_email(
    email_to: str, username: str, password: str
) -> EmailData:
    """
    신규 계정 생성 이메일 생성(관리자)
    """
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New account for user {username}"
    link = f"{settings.FRONTEND_HOST}/"
    html_content = render_email_template(
        template_name="new_account.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": username,
            "password": password,
            "email": email_to,
            "link": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_test_email(email_to: str) -> EmailData:
    """
    테스트 이메일 생성
    """
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Test email"
    html_content = render_email_template(
        template_name="test_email.html",
        context={"project_name": settings.PROJECT_NAME, "email": email_to},
    )
    return EmailData(html_content=html_content, subject=subject)
