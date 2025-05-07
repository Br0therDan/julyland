# path: app/exceptions/subscription.py

from fastapi import HTTPException, status

SUBSCRIPTION_NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="구독 정보가 없습니다."
)

ALREADY_SUBSCRIBED = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST, detail="이미 구독 중입니다."
)


APP_NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="앱 정보가 없습니다."
)

EXISTING_APP = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST, detail="이미 등록된 애플리케이션 입니다."
)
