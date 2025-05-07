# path: app/exceptions/auth.py

from fastapi import HTTPException, status

INVALID_CREDENTIALS = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN, detail="유효하지 않은 인증 정보입니다."
)

USER_NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다."
)

EXISTING_USER = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST, detail="이미 존재하는 사용자입니다."
)

INACTIVE_USER = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST, detail="귀하는 비활성 사용자 입니다."
)

UNVERIFIED_EMAIL = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="이메일 검증이 되지 않은 사용자입니다.",
)

SUPERUSER_REQUIRED = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN, detail="귀하는 슈퍼유저 권한이 없습니다."
)

INVALID_OR_EXPIRED_TOKEN = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST, detail="유효하지 않거나 만료된 토큰입니다."
)

EMAIL_ALREADY_VERIFIED = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST, detail="이미 이메일이 검증되었습니다."
)

OLD_PASSWORD_INCORRECT = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST, detail="기존 비밀번호가 일치하지 않습니다."
)

INCORRECT_PASSWORD = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST, detail="비밀번호가 일치하지 않습니다."
)

ERROR_IN_TOKEN_GENERATION = HTTPException(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail="토큰 생성 중 오류가 발생했습니다.",
)

NO_TOKEN_PROVIDED = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN, detail="토큰이 제공되지 않았습니다."
)

FAILED_TO_GET_OAUTH_URL = HTTPException(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail="OAuth 인증 URL을 가져오는 데 실패했습니다.",
)

INVALID_TOKEN_TYPE = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST, detail="유효하지 않은 토큰 타입입니다."
)
