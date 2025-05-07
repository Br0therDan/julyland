# Path: app/schemas/product.py
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from beanie import PydanticObjectId
from app.schemas.brand import BrandPublic
from app.models.product import LocaleName
from app.schemas.media import MediaAssetPublic

class ProductCreate(BaseModel):
    name: str
    locale_names: List[LocaleName]
    description: Optional[str] = None
    media_urls: Optional[List[str]] = None
    brand_id: PydanticObjectId

    class Config:
        extra='allow'
        
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    locale_names: Optional[List[LocaleName]] = None
    description: Optional[str]
    media_urls: Optional[List[str]] = None
    brand_id: Optional[PydanticObjectId]
    
    class Config:
        extra='allow'

class ProductPublic(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    name: str
    locale_names: List[LocaleName]
    description: Optional[str] = None
    media_urls: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime
    brand: BrandPublic
    
    class Config:
        from_attributes = True
