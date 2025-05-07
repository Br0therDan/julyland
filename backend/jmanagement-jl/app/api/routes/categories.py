# Path: app/api/routes/categories.py
from fastapi import APIRouter, HTTPException, Query, status
from typing import List
from beanie import PydanticObjectId
from app.models.product import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryPublic

router = APIRouter()

@router.get("/", response_model=List[CategoryPublic])
async def list_categories(skip: int = Query(0, ge=0), limit: int = Query(100, gt=0)):
    docs = await Category.find_all().skip(skip).limit(limit).to_list()
    return [CategoryPublic(**d.model_dump(by_alias=True)) for d in docs]

@router.post("/", response_model=CategoryPublic, status_code=status.HTTP_201_CREATED)
async def create_category(obj_in: CategoryCreate):
    if await Category.find_one(Category.name == obj_in.name):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 존재하는 카테고리입니다.")
    new = await Category(**obj_in.model_dump()).insert()
    return CategoryPublic(**new.model_dump(by_alias=True))

@router.get("/{category_name}", response_model=CategoryPublic)
async def read_category(category_name: str):
    doc = await Category.find_one(Category.name == category_name, fetch_links=True)
    if not doc:
        raise HTTPException(status_code=404, detail="카테고리를 찾을 수 없습니다")
    return CategoryPublic(**doc.model_dump(by_alias=True))

@router.put("/{id}", response_model=CategoryPublic)
async def update_category(id: PydanticObjectId, obj_in: CategoryUpdate):
    doc = await Category.get(id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="카테고리를 찾을 수 없습니다")
    updated = await doc.update({"$set": obj_in.model_dump(exclude_none=True)})
    return CategoryPublic(**updated.model_dump(by_alias=True))

@router.delete("/{id}")
async def delete_category(id: PydanticObjectId):
    doc = await Category.get(id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="카테고리를 찾을 수 없습니다")
    await doc.delete()
    return {"message": "Category deleted", "id": str(id)}
