# Path: app/api/routes/variants.py
import asyncio
from fastapi import APIRouter, HTTPException, Query, status
from typing import List
from beanie import PydanticObjectId
from app.models.product import Product, Variant
from app.schemas.variant import VariantCreate, VariantUpdate, VariantPublic

router = APIRouter()

@router.get("/", response_model=List[VariantPublic])
async def list_variants(
    product_id: PydanticObjectId = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0),
):
    filter = {}
    if product_id:
        filter["product.id"] = product_id
    docs = await Variant.find(fetch_links=True).skip(skip).limit(limit).to_list()
    return [VariantPublic(**d.model_dump(by_alias=True)) for d in docs]


@router.post(
    "/", 
    response_model=VariantPublic, 
    status_code=status.HTTP_201_CREATED,
    summary="상품 변형 생성", 
    responses={409: {"description": "이미 존재하는 제품 변형입니다."}},
)
async def create_variant(obj_in: VariantCreate):
    product = await Product.get(obj_in.product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="제품을 찾을 수 없습니다.")
    variant = Variant(
        name=obj_in.name,
        media_urls=obj_in.media_urls,
        barcode=obj_in.barcode,
        options=[opt.model_dump() for opt in obj_in.options] if obj_in.options else [],
        price=obj_in.price,
        product=product,
    )
    await variant.insert()
    new_variant = await Variant.get(variant.id, fetch_links=True)
    return VariantPublic(**new_variant.model_dump(by_alias=True))


@router.get("/{id}", response_model=VariantPublic)
async def read_variant(id: PydanticObjectId):
    doc = await Variant.get(id, fetch_links=True)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="제품 변형을 찾을 수 없습니다.")
    return VariantPublic(**doc.model_dump(by_alias=True))

@router.get("/{barcode}", response_model=VariantPublic)
async def search_variant_by_barcode(barcode: str):
    doc = await Variant.find_one({"barcode": barcode}, fetch_links=True)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="제품 변형을 찾을 수 없습니다.")
    return VariantPublic(**doc.model_dump(by_alias=True))


@router.put("/{id}", response_model=VariantPublic)
async def update_variant(id: PydanticObjectId, obj_in: VariantUpdate):
    doc = await Variant.get(id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="제품 변형을 찾을 수 없습니다.")
    updated = await doc.update({"$set": obj_in.model_dump(exclude_none=True)})
    return VariantPublic(**updated.model_dump(by_alias=True))


@router.delete("/{id}")
async def delete_variant(id: PydanticObjectId):
    """
    ID로 상품 변형 삭제
    """
    doc = await Variant.get(id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="제품 변형을 찾을 수 없습니다.")
    await doc.delete()
    return {"message": "제품 변형이 삭제되었습니다", "id": str(id)}
