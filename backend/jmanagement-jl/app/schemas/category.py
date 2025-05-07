# Path: app/schemas/category.py
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from beanie import PydanticObjectId


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    subcategories: Optional[List[str]] = []
    class Config:
        extra='allow'

class CategoryUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    subcategories: Optional[List[str]]

class CategoryPublic(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    name: str
    description: Optional[str] = None
    subcategories: Optional[List[str]] = []

    class Config:
        from_attributes = True