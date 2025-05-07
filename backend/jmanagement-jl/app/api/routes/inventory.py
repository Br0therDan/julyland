# Path: app/api/routes/inventory.py
from fastapi import APIRouter, HTTPException, Query, status
from typing import List
from beanie import PydanticObjectId
from app.models.inventory import Inventory
from app.schemas.inventory import InventoryCreate, InventoryPublic

router = APIRouter()

@router.get("/", response_model=List[InventoryPublic])
async def list_inventory(skip: int = Query(0, ge=0), limit: int = Query(100, gt=0)):
    docs = await Inventory.find_all().skip(skip).limit(limit).to_list()
    for d in docs:
        await d.fetch_link(Inventory.variant)
    return [InventoryPublic(**d.model_dump(by_alias=True)) for d in docs]



@router.post(
    "/", 
    response_model=InventoryPublic, 
    status_code=status.HTTP_201_CREATED,
    summary="재고 변경 내역 생성",
    responses={409: {"description": "Inventory already exists"}}
)
async def create_inventory(obj_in: InventoryCreate):
    if obj_in.variant_id and await Inventory.find_one(Inventory.variant == obj_in.variant_id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Inventory already exists")
    inventory = await Inventory(
        variant=obj_in.variant_id,
        change_type=obj_in.change_type,
        quantity=obj_in.quantity
    ).insert()
    new = await Inventory.get(inventory.id, fetch_links=True)
    return InventoryPublic(**new.model_dump(by_alias=True))

@router.get("/{id}", response_model=InventoryPublic)
async def read_inventory(id: PydanticObjectId):
    """
    ID로 재고 변경 내역 조회
    """
    doc = await Inventory.get(id, fetch_links=True)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory record not found")
    return InventoryPublic(**doc.model_dump(by_alias=True))

@router.put("/{id}", response_model=InventoryPublic)
async def update_inventory(id: PydanticObjectId, obj_in: InventoryCreate):
    """
    ID로 재고 변경 내역 업데이트
    """
    doc = await Inventory.get(id, fetch_links=True)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory record not found")
    updated = await doc.update({"$set": obj_in.model_dump()})
    return InventoryPublic(**updated.model_dump(by_alias=True))

@router.delete("/{id}")
async def delete_inventory(id: PydanticObjectId):
    """
    ID로 재고 변경 내역 삭제
    """
    doc = await Inventory.get(id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory record not found")
    await doc.delete()
    return {"message": "Inventory record deleted", "id": str(id)}
