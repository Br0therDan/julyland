# path: app/exceptions/docs.py

from fastapi import HTTPException, status

ITEM_NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="아이템을 찾을 수 없습니다."
)

DOCUMENT_NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="문서를 찾을 수 없습니다."
)

MEDIA_ASSET_NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="미디어 자산을 찾을 수 없습니다."
)

EXISTING_CATEGORY = HTTPException(
    status_code=status.HTTP_409_CONFLICT, detail="이미 존재하는 카테고리입니다."
)

EXISTING_SUBCATEGORY = HTTPException(
    status_code=status.HTTP_409_CONFLICT, detail="이미 존재하는 서브카테고리입니다."
)

FORBIDDEN = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN, detail="허용되지 않은 요청입니다."
)

NOT_AUTHORISED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED, detail="권한이 없습니다."
)

TOKEN_EXPIRED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED, detail="토큰이 만료되었습니다."
)

INVALID_TOKEN = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED, detail="유효하지 않은 토큰입니다."
)

MEDIA_UPLOAD_FAILED = HTTPException(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail="미디어 업로드에 실패했습니다.",
)


CATEGORY_NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="카테고리를 찾을 수 없습니다."
)

SUBCATEGORY_NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="서브카테고리를 찾을 수 없습니다."
)

ITEM_ALREADY_EXISTS = HTTPException(
    status_code=status.HTTP_409_CONFLICT, detail="이미 존재하는 아이템입니다."
)

REQUIRE_ID_OR_TITLE = HTTPException(
    status_code=400, detail="doc_id 또는 title을 입력해주세요."
)


EXISTING_CATEGORY = HTTPException(
    status_code=status.HTTP_409_CONFLICT, detail="이미 존재하는 카테고리입니다."
)

EXISTING_SUBCATEGORY = HTTPException(
    status_code=status.HTTP_409_CONFLICT, detail="이미 존재하는 서브카테고리입니다."
)

FORBIDDEN = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN, detail="허용되지 않은 요청입니다."
)

NOT_AUTHORISED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED, detail="권한이 없습니다."
)
