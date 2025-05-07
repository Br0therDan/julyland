# app/schemas/ranking.py
from datetime import datetime
from beanie import PydanticObjectId
from pydantic import BaseModel, Field
from typing import List, Optional


class ItemPublic(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    item_id: str
    item_name: str
    link: str
    brand_name: Optional[str] = None
    brand_link: Optional[str] = None
    thumbnail: Optional[str] = None
    ship_info: Optional[str] = None
    is_official: bool

class ItemSnapshotPublic(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    item: ItemPublic
    category: Optional[str] = None
    rank: Optional[int]
    sold: Optional[int]
    original_price: Optional[int]
    sale_price: Optional[int]
    discount_rate: Optional[float]
    mega_price: Optional[int]
    mega_discount_rate: Optional[float]
    review_count: Optional[int]

class RankingPublic(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    category: str
    timestamp: datetime
    counts: int

class RankingSnapshotPublic(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    category: str
    items: List[ItemSnapshotPublic]
    timestamp: datetime

class ScrapeItem(BaseModel):
    item_id: str
    item_name: str
    link: str
    brand_name: Optional[str] = None
    brand_link: Optional[str] = None
    thumbnail: Optional[str] = None
    ship_info: Optional[str] = None
    is_official: bool = False
    rank: Optional[int]
    sold: Optional[int]
    original_price: Optional[int]
    sale_price: Optional[int]
    discount_rate: Optional[float]
    mega_price: Optional[int]
    mega_discount_rate: Optional[float]
    review_count: Optional[int]
