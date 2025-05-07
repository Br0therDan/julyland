# Path: app/schemas/brand.py

from typing import Optional
from pydantic import BaseModel, Field
from beanie import PydanticObjectId
from app.schemas.category import CategoryPublic


class BrandCreate(BaseModel):
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    category_id: PydanticObjectId
    
    class Config:
        extra='allow'
        json_schema_extra = {
            "example": {
                "name": "Brand Name",
                "description": "Brand Description",
                "logo_url": "https://example.com/logo.png",
                "category_id": "60d5f484f1c2b8a3d4e4b8c1"
            }
        }

class BrandUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    logo_url: Optional[str]
    category_id: Optional[PydanticObjectId]

class BrandPublic(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    category: CategoryPublic

    class Config:
        from_attributes = True
