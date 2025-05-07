
from datetime import datetime
from pydantic import BaseModel, Field
from beanie import PydanticObjectId


class MediaAssetCreate(BaseModel):
    type: str
    file_name: str
    mime_type: str

class MediaAssetUpdate(BaseModel):
    url: str
    type: str
    file_name: str
    mime_type: str


class MediaAssetPublic(BaseModel):
    id: PydanticObjectId = Field(..., alias="_id")
    type: str
    url: str
    file_name: str
    mime_type: str
    created_at: datetime
    updated_at: datetime
