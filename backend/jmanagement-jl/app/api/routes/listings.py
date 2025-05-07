# Path: app/api/routes/listings.py
from fastapi import APIRouter, HTTPException, Query, status
from typing import List
from beanie import PydanticObjectId
from app.models.listing import Listing
from app.schemas.listing import ListingCreate, ListingPublic

router = APIRouter()

@router.get("/", response_model=List[ListingPublic])
async def list_listings(skip: int = Query(0, ge=0), limit: int = Query(100, gt=0)):
    """
    모든 리스팅 조회
    """
    docs = await Listing.find_all().skip(skip).limit(limit).to_list()
    for d in docs:
        await d.fetch_link(Listing.variant)
    return [ListingPublic(**d.model_dump(by_alias=True)) for d in docs]

@router.post(
    "/",
    response_model=ListingPublic,
    summary="리스팅 생성",
    responses={409: {"description": "Listing already exists"}}
)
async def create_listing(obj_in: ListingCreate):
    if await Listing.find_one(Listing.variant == obj_in.variant_id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Listing already exists")
    new = await Listing(
        variant=obj_in.variant_id,
        marketplace=obj_in.marketplace,
        marketplace_item_id=obj_in.marketplace_item_id,
        status=obj_in.status
    ).insert()
    await new.fetch_link(Listing.variant)
    return ListingPublic(**new.model_dump(by_alias=True))


@router.get("/{id}", response_model=ListingPublic)
async def read_listing(id: PydanticObjectId):
    """
    ID로 리스팅 조회
    """
    doc = await Listing.get(id, fetch_links=True)
    if not doc:
        raise HTTPException(status_code=404, detail="Listing not found")
    return ListingPublic(**doc.model_dump(by_alias=True))

@router.put("/{id}", response_model=ListingPublic)
async def update_listing(id: PydanticObjectId, obj_in: ListingCreate):
    """
    ID로 리스팅 정보 업데이트
    """
    doc = await Listing.get(id)
    if not doc:
        raise HTTPException(status_code=404, detail="Listing not found")
    updated = await doc.update({"$set": obj_in.model_dump()})
    await updated.fetch_link(Listing.variant)
    return ListingPublic(**updated.model_dump(by_alias=True))

@router.delete("/{id}")
async def delete_listing(id: PydanticObjectId):
    """
    ID로 리스팅 삭제
    """
    doc = await Listing.get(id)
    if not doc:
        raise HTTPException(status_code=404, detail="Listing not found")
    await doc.delete()
    return {"message": "Listing deleted", "id": str(id)}
