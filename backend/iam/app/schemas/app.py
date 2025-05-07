# path: app/schemas/service.py

from beanie import PydanticObjectId
from pydantic import BaseModel, Field
from typing import Optional


class AppCreate(BaseModel):
    """서비스 생성 요청"""

    name: str
    logo: str = None
    description: str = None

    # scopes: Optional[list[PydanticObjectId]] = None
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "name": "homebrew",
                "logo": "Beer",  # Lucide icons
                "description": "Homebrew service",
            }
        }


class AppUpdate(BaseModel):
    """서비스 업데이트 요청"""

    name: Optional[str] = None
    logo: Optional[str] = None
    description: Optional[str] = None

    # scopes: Optional[list[PydanticObjectId]] = None
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "name": "example",
                "logo": "example",
                "description": "example service",
            }
        }


class AppPublic(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    name: str
    logo: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True
