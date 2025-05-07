# Path: app/models/brand.py
from typing import Optional
from beanie import Document
class MarketPlace(Document):
    name: str
    description: Optional[str] = None

    class Settings:
        name = "market_places"