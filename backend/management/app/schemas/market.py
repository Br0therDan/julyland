# Path: app/models/brand.py
from typing import Optional
from beanie import PydanticObjectId
from pydantic import BaseModel, Field

class MarketPlaceCreate(BaseModel):
    name: str
    description: Optional[str] = None

    class Config:
        extra='allow'
        json_schema_extra = {
            "example": {
                "name": "Qoo10",
                "description": "Qoo10 Marketplace"
            }
        }

class MarketPlaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

    class Config:
        extra='allow'
        json_schema_extra = {
            "example": {
                "name": "Amazon",
                "description": "Amazon Marketplace"
            }
        }

class MarketPlacePublic(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "_id": "60a7b2e1e1d23a5f8e123456",
                "name": "Amazon",
                "description": "Amazon Marketplace"
            }
        }