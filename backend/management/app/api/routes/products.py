# Path: app/api/routes/products.py
from fastapi import APIRouter, HTTPException, Query, status
from typing import List
from beanie import PydanticObjectId
from app.models.product import Product, Brand
from app.schemas.product import ProductCreate, ProductUpdate, ProductPublic
from app.models.media_asset import MediaAsset

router = APIRouter()

@router.get("/", response_model=List[ProductPublic])
async def list_products(category_name: str = Query(None), brand_name: str = Query(None), skip: int = Query(0, ge=0), limit: int = Query(100, gt=0)):
    filters = {}
    if category_name and category_name != "total":
        filters["brand.category.name"] = category_name
    if brand_name:
        filters["brand.name"] = brand_name
    docs = await Product.find(filters, fetch_links=True).skip(skip).limit(limit).to_list()
    for d in docs:
        await d.fetch_all_links()
    return [ProductPublic(**d.model_dump(by_alias=True)) for d in docs]


@router.post("/", response_model=ProductPublic, status_code=status.HTTP_201_CREATED)
async def create_product(obj_in: ProductCreate):
    if await Product.find_one(Product.name == obj_in.name, fetch_links=True):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 존재하는 제품입니다.")
    brand = await Brand.get(obj_in.brand_id)
    new = await Product(
        name=obj_in.name,
        description=obj_in.description,
        brand_id=obj_in.brand_id,
        media_urls=obj_in.media_urls,
        brand=brand
    ).insert()
    await new.fetch_all_links()
    return ProductPublic(**new.model_dump(by_alias=True))


@router.get("/{id}", response_model=ProductPublic)
async def read_product(id: PydanticObjectId):
    doc = await Product.get(id, fetch_links=True)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="제품을 찾을 수 없습니다")
    return ProductPublic(**doc.model_dump(by_alias=True))


@router.put("/{id}", response_model=ProductPublic)
async def update_product(id: PydanticObjectId, obj_in: ProductUpdate):
    doc = await Product.get(id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="제품을 찾을 수 없습니다")
    updated = await doc.update({"$set": obj_in.model_dump(exclude_none=True)})
    return ProductPublic(**updated.model_dump(by_alias=True))


@router.delete("/{id}")
async def delete_product(id: PydanticObjectId):
    doc = await Product.get(id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="제품을 찾을 수 없습니다")
    await doc.delete()
    return {"message": "Product deleted", "id": str(id)}

