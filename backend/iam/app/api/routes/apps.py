import logging
from typing import List

from fastapi import APIRouter

from app.exceptions.subscription import APP_NOT_FOUND
from app.models import App
from app.schemas.app import AppPublic

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/public",
    response_description="App List retrieved",
    response_model=List[AppPublic],
)
async def read_apps() -> List[AppPublic]:
    """
    [관리자 전용] 서비스 조회
    """
    apps = await App.find({}).to_list()
    if not apps:
        raise APP_NOT_FOUND
    return [AppPublic.model_validate(app.model_dump(by_alias=True)) for app in apps]
