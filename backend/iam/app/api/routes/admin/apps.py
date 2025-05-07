import logging

from beanie import PydanticObjectId
from fastapi import APIRouter, Body, HTTPException, Depends

from app.api.deps import get_current_active_superuser
from app.exceptions.subscription import APP_NOT_FOUND
from app.models import App
from app.schemas.token import Message
from app.schemas.app import AppCreate, AppUpdate, AppPublic

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/apps")

# --------------------------------------------------------
# 관리자 전용 앱관리 API
# --------------------------------------------------------


@router.post(
    "/",
    response_description="App created",
    response_model=AppPublic,
    dependencies=[Depends(get_current_active_superuser)],
)
async def create_app(app_in: AppCreate) -> AppPublic:
    """
    [관리자 전용] 서비스 생성
    """
    # 이름을 기준으로 중복 여부 체크 (필요에 따라 다른 unique 조건 사용)
    existing_app = await App.find_one({"name": app_in.name})
    if existing_app:
        # 여기서는 중복이면 적절한 예외를 던지도록 처리합니다.
        raise HTTPException(status_code=400, detail="App already exists")
    new_app = App(**app_in.model_dump())
    await new_app.insert()
    return AppPublic.model_validate(new_app.model_dump(by_alias=True))


@router.get(
    "/",
    response_description="App List retrieved",
    response_model=list[AppPublic],
)
async def read_apps() -> list[AppPublic]:
    """
    [관리자 전용] 서비스 목록 조회
    """
    apps = await App.find({}).to_list()
    if not apps:
        raise APP_NOT_FOUND
    return [AppPublic.model_validate(app.model_dump(by_alias=True)) for app in apps]


@router.get(
    "/{app_name}",
    response_model=AppPublic,
    summary="[관리자]특정 App 조회",
)
async def read_app_by_name(app_name: str) -> AppPublic:
    """
    특정 App의 상세 정보를 조회합니다.

    :param name: 조회할 App의 ObjectId
    :return: AppPublic 객체
    :raises HTTPException: App을 찾지 못한 경우 (404)
    """
    app_obj = await App.find_one({"name": app_name})
    if not app_obj:
        raise APP_NOT_FOUND
    return app_obj


@router.get("/{app_id}", response_model=AppPublic)
async def read_app_by_id(app_id: PydanticObjectId) -> AppPublic:
    """
    특정 서비스 정보 조회
    """
    app = await App.get(app_id)
    if not app:
        raise APP_NOT_FOUND
    return AppPublic.model_validate(app.model_dump(by_alias=True))


@router.patch(
    "/{app_id}",
    response_description="App updated",
    response_model=AppPublic,
    dependencies=[Depends(get_current_active_superuser)],
)
async def update_app(
    app_id: PydanticObjectId,
    update_data: AppUpdate = Body(...),
) -> AppPublic:
    """
    [관리자 전용] 서비스 정보 수정
    """
    app_obj = await App.get(app_id)
    if not app_obj:
        raise APP_NOT_FOUND
    update_dict = update_data.model_dump(exclude_unset=True)
    await app_obj.update({"$set": update_dict})
    updated_app = await App.get(app_id)
    return AppPublic.model_validate(updated_app.model_dump(by_alias=True))


@router.delete(
    "/{app_id}",
    response_description="App deleted",
    response_model=Message,
    dependencies=[Depends(get_current_active_superuser)],
)
async def delete_app(app_id: PydanticObjectId) -> Message:
    """
    [관리자 전용] 서비스 삭제
    """
    entry = await App.get(app_id)
    if not entry:
        raise APP_NOT_FOUND
    await entry.delete()
    return Message(message="App deleted successfully")
