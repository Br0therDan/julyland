from beanie import Document, Indexed, Link, after_event, Insert
from pydantic import  Field
from datetime import datetime, timezone, timedelta
from typing import Annotated, List, Optional

from app.models.base import BaseDocument


class Item(BaseDocument):
    item_id: Annotated[str, Indexed(unique=True)]
    item_name: str
    link: str
    brand_name: Optional[str] = None
    brand_link: Optional[str] = None
    thumbnail: Optional[str] = None
    ship_info: Optional[str] = None
    is_official: bool = False
    class Settings:
        name= "items"

class ItemSnapshot(Document):
    item: Link[Item]
    rank: Optional[int] = None
    category: Optional[str]= None
    sold: Optional[int] = None
    original_price: Optional[int] = None
    sale_price: Optional[int] = None
    discount_rate: Optional[float] = None
    mega_price: Optional[int] = None
    mega_discount_rate: Optional[float] = None
    review_count: Optional[int] = None
    class Settings:
        name = "item_snapshots"
        indexes = [
            [("item", 1), ("ranking_snapshot", 1)]
        ]

class RankingSnapshot(BaseDocument):
    category: str
    timestamp: datetime = Field(default_factory=datetime.now)
    items: List[Link[ItemSnapshot]] = []

    class Settings:
        name = "ranking_snapshots"
        indexes = [
            [("category", 1), ("display_time", -1)],
        ]

    async def save(self, *args, **kwargs):
        self.updated_at = datetime.now(timezone.utc)
        return await super().save(*args, **kwargs)

    @after_event(Insert)
    async def prune_old_snapshots(self):
        threshold = datetime.now(timezone.utc) - timedelta(days=7)
        collection = self.get_motor_collection()
        await collection.delete_many({
            "category": self.category,
            "display_time": {"$lt": threshold}
        })
