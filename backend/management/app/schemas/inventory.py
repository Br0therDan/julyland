# Path: app/schemas/inventory.py
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field
from beanie import PydanticObjectId
from app.schemas.variant import VariantPublic

class InventoryCreate(BaseModel):
    variant_id: PydanticObjectId
    change_type: Literal["in","out","adjust"]
    quantity: int
    class Config:
        extra='allow'
        json_schema_extra = {

            "example": {
                "variant_id": "6810abc648c0e7f0cb3c4bec",
                "change_type": "in",
                "quantity": 100
            }
        }

class InventoryPublic(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    variant: VariantPublic
    change_type: Literal["in","out","adjust"]
    quantity: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "_id": "6810abc648c0e7f0cb3c4bec",
                "variant": {
                    "_id": "6810abc648c0e7f0cb3c4bec",
                    "name": "Variant Name",
                    "sku": "SKU12345",
                    "options": [
                        {"name": "Color", "value": "Red"},
                        {"name": "Size", "value": "M"}
                    ],
                    "price": 19.99
                },
                "change_type": "in",
                "quantity": 100,
                "timestamp": "2023-10-01T12:00:00Z",
                "created_at": "2023-10-01T12:00:00Z",
                "updated_at": "2023-10-01T12:00:00Z"
            }
        }   