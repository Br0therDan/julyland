# Path: app/api/routes/brands.py
from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from beanie import PydanticObjectId
from app.models.product import Category,Brand
from app.schemas.brand import BrandCreate, BrandUpdate, BrandPublic

router = APIRouter()

@router.get("/", response_model=List[BrandPublic])
async def list_brands(
    category_name: Optional[str] = Query(None),
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, gt=0)
):  
    filter = {}
    if category_name and category_name != "total":
        category = await Category.find_one(Category.name == category_name)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="카테고리를 찾을 수 없습니다.")
        filter["category"] = category
    
    docs = await Brand.find(filter).skip(skip).limit(limit).to_list()
    return [BrandPublic(**d.model_dump(by_alias=True)) for d in docs]

@router.post("/", response_model=BrandPublic, status_code=status.HTTP_201_CREATED)
async def create_brand(obj_in: BrandCreate):
    cat = await Category.get(obj_in.category_id)
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="카테고리를 찾을 수 없습니다.")
    if await Brand.find_one(Brand.name == obj_in.name):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 존재하는 브랜드입니다.")
    new = await Brand(
        name=obj_in.name,
        description=obj_in.description,
        logo_url=obj_in.logo_url,
        category=cat,
    ).insert()
    await new.fetch_all_links()
    return BrandPublic(**new.model_dump(by_alias=True))

@router.get("/{id}", response_model=BrandPublic)
async def read_brand(id: PydanticObjectId):
    doc = await Brand.get(id, fetch_links=True)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="브랜를를 찾을 수 없습니다.")
    return BrandPublic(**doc.model_dump(by_alias=True))

@router.put("/{id}", response_model=BrandPublic)
async def update_brand(id: PydanticObjectId, obj_in: BrandUpdate):
    doc = await Brand.get(id, fetch_links=True)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="브랜를를 찾을 수 없습니다.")
    updated = await doc.update({"$set": obj_in.model_dump(exclude_none=True)})
    return BrandPublic(**updated.model_dump(by_alias=True))

@router.delete("/{id}")
async def delete_brand(id: PydanticObjectId):
    doc = await Brand.get(id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="브랜를를 찾을 수 없습니다.")
    await doc.delete()
    return {"message": "Brand deleted", "id": str(id)}