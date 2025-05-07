# Path: app/models/product.py

from beanie import PydanticObjectId
from app.models.base import BaseDocument

class MediaAsset(BaseDocument):
    type: str
    url: str
    file_name: str
    mime_type: str

    class Settings:
        name = "media_assets"
        