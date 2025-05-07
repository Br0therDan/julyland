# Path: app/api/routes/media.py
from fastapi import APIRouter, HTTPException
from beanie import PydanticObjectId
from app.models.media_asset import MediaAsset
from app.schemas.media import MediaAssetCreate, MediaAssetPublic
from app.services.store_to_bucket import get_presigned_url
# from app.api.storage import get_presigned_url 

router = APIRouter()


@router.post(
    "/upload",
    response_model=MediaAssetPublic,
    summary="이미지/영상 업로드 및 MediaAsset 생성",
)
async def upload_media(
    media_data: MediaAssetCreate,
) -> MediaAssetPublic:
    try:
        # 동기 함수이므로 await 제거
        presigned_url = get_presigned_url(
            media_data.file_name, 
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Presigned URL 발급 실패: {str(e)}",
        )
    new_media = MediaAsset(
        type=media_data.type,
        url=presigned_url,
        file_name=media_data.file_name,
        mime_type=media_data.mime_type,
    )
    await new_media.insert()
    return MediaAssetPublic(**new_media.model_dump(by_alias=True))

@router.get(
    "/{media_id}",
    response_model=MediaAssetPublic,
    summary="특정 미디어 조회",
)
async def read_media(media_id: PydanticObjectId) -> MediaAssetPublic:
    media = await MediaAsset.get(media_id)
    if not media:
        raise HTTPException(
            status_code=404,
            detail="미디어 자산을 찾을 수 없습니다.",
        )
    return media


@router.delete(
    "/{media_id}",
    summary="미디어 삭제",
)
async def delete_media(
    media_id: PydanticObjectId,
):
    media = await MediaAsset.get(media_id)
    if not media:
        raise HTTPException(
            status_code=404,
            detail="미디어 자산을 찾을 수 없습니다.",
        )
    # if media.uploaded_by != current_user.id:
    #     raise FORBIDDEN
    # 실제 Object Storage에서 파일 삭제 로직 추가 (예: AWS S3 삭제 API 호출)
    await media.delete()
    return {"message": "미디어 자산이 성공적으로 삭제되었습니다."}
