# Path: app/schemas/product.py
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from beanie import PydanticObjectId
from app.models.product import VariantOption
from app.schemas.product import ProductPublic
from app.models.media_asset import MediaAsset


class VariantCreate(BaseModel):
    name: str
    barcode: Optional[str] = None
    media_urls: Optional[List[str]] = None
    options: Optional[List[VariantOption]] = None
    price: float
    product_id: PydanticObjectId
    
    class Config:
        extra='allow'
        json_schema_extra = {
            "example": {
                "name": "Sample Variant",
                "images": ["http://example.com/image1.jpg", "http://example.com/image2.jpg"],
                "options": [
                    {"name": "Color", "value": "Red"},
                    {"name": "Size", "value": "M"}
                ],
                "price": 19.99,
                "product_id": "6818be2b6f3825e94c1d93e8"
            }
        }

class VariantUpdate(BaseModel):
    name: Optional[str]
    barcode: Optional[str] = None
    media_urls: Optional[List[str]] = None
    options: Optional[List[VariantOption]]
    price: Optional[float]
    product_id: Optional[PydanticObjectId]


class VariantPublic(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    name: str
    barcode: Optional[str] = None
    sku: Optional[str]
    media_urls: Optional[List[str]]
    options: Optional[List[VariantOption]]
    price: float
    created_at: datetime
    updated_at: datetime

    product: ProductPublic

    class Config:
        from_attributes = True
