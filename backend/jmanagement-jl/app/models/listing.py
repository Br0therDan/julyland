# Path: app/models/listing.py
from typing import Literal, Optional
from datetime import datetime
from beanie import Link
from app.models.base import BaseDocument
from app.models.product import Variant
from app.models.market import MarketPlace

class Listing(BaseDocument):
    market_place: Link["MarketPlace"]
    variant: Link[Variant]
    marketplace_item_id: str       # 해당 마켓 플랫폼에서 부여된 아이디
    status: Literal["draft", "published", "error"]
    last_synced: Optional[datetime] = None

    class Settings:
        name = "listings"
        indexes = [
            ["market_place", "variant"],
            ["market_place", "marketplace_item_id"]
        ]