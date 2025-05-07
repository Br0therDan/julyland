# Path: app/schemas/listing.py
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field
from beanie import PydanticObjectId
from app.schemas.variant import VariantPublic
from app.schemas.market import MarketPlacePublic

class ListingCreate(BaseModel):
    market_place_id: PydanticObjectId
    variant_id: PydanticObjectId
    marketplace_item_id: str
    status: Literal["draft","published","error"]

    class Config:
        extra='allow'
        json_schema_extra = {

            "example": {
                "variant_id": "6810abc648c0e7f0cb3c4bec",
                "marketplace": "Qoo10",
                "marketplace_item_id": "Qoo1234567890",
                "status": "draft"
            }
        }

class ListingPublic(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    variant: VariantPublic
    marketplace: MarketPlacePublic
    marketplace_item_id: str
    status: Literal["draft","published","error"]
    last_synced: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True