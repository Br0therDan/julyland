# Path: app/api/routes/categories.py
from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from beanie import PydanticObjectId
from app.models.market import MarketPlace
from app.schemas.market import MarketPlaceCreate, MarketPlaceUpdate, MarketPlacePublic

router = APIRouter()

@router.get("/", response_model=List[MarketPlacePublic])
async def list_markets(skip: int = Query(0, ge=0), limit: int = Query(100, gt=0)):
    docs = await MarketPlace.find_all().skip(skip).limit(limit).to_list()
    return [MarketPlacePublic(**d.model_dump(by_alias=True)) for d in docs]

@router.post("/", response_model=MarketPlacePublic, status_code=status.HTTP_201_CREATED)
async def create_market(obj_in: MarketPlaceCreate):
    if await MarketPlace.find_one(MarketPlace.name == obj_in.name):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="MarketPlace already exists")
    new = await MarketPlace(**obj_in.model_dump()).insert()
    return MarketPlacePublic(**new.model_dump(by_alias=True))

@router.get("/{id}", response_model=MarketPlacePublic)
async def read_market(id: PydanticObjectId):
    doc = await MarketPlace.get(id)
    if not doc:
        raise HTTPException(status_code=404, detail="MarketPlace not found")
    return MarketPlacePublic(**doc.model_dump(by_alias=True))

@router.put("/{id}", response_model=MarketPlacePublic)
async def update_market(id: PydanticObjectId, obj_in: MarketPlaceUpdate):
    doc = await MarketPlace.get(id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MarketPlace not found")
    updated = await doc.update({"$set": obj_in.model_dump(exclude_none=True)})
    return MarketPlacePublic(**updated.model_dump(by_alias=True))

@router.delete("/{id}")
async def delete_market(id: PydanticObjectId):
    doc = await MarketPlace.get(id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MarketPlace not found")
    await doc.delete()
    return {"message": "MarketPlace deleted", "id": str(id)}
