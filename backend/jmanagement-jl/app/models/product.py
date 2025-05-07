# Path: app/models/product.py

import re
from typing import Optional, List, Union
from beanie import Document, Insert, Link, before_event
from pydantic import BaseModel
from app.models.base import BaseDocument
from app.models.media_asset import MediaAsset

class Category(Document):
    name: str
    description: Optional[str] = None
    subcategories: Optional[List[str]] = None
    brands: List[Link['Brand']] = []
    
    class Settings:
        name = "categories"

class Brand(Document):
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    category: Category
    products: List[Link['Product']] = []

    class Settings:
        name = "brands"

class LocaleName(BaseModel):
    locale: str
    name: str
    
class Product(BaseDocument):
    name: str
    locale_names: List[LocaleName] = []
    description: Optional[str] = None
    media_urls: Optional[List[str]] = None
    brand: Brand
    tags: Optional[List[str]] = None

    variants: List[Link['Variant']] = []

    class Settings:
        name = "products"

class VariantOption(BaseModel):
    name: str
    value: Union[str, int]
    unit: Optional[str] = None 

class Variant(BaseDocument):
    name: str          # 예: "레드 500ml 패키지"
    sku: Optional[str] = None  # SKU는 자동 생성
    barcode: Optional[str] = None
    options: List[VariantOption]= []
    media_urls: Optional[List[str]] = None
    price: float

    product: Product

    class Settings:
        name = "variants"


    @before_event(Insert)
    async def generate_sku_if_missing(self):
        if not self.sku:
            self.sku = generate_sku(
                category_name=self.product.brand.category.name,
                brand_name=self.product.brand.name,
                product_name=self.product.name,
                options=self.options
            )


def generate_sku(category_name: str, brand_name: str, product_name: str, options: List[VariantOption]) -> str:
    def sanitize(text: str, max_len: int) -> str:
        return ''.join(filter(str.isalnum, text.upper()))[:max_len]

    def get_initials(name: str, max_len: int) -> str:
        # 공백, 특수문자 기준으로 단어 분리
        parts = re.split(r"[ \-_/\.]", name.upper())
        initials = ''.join([p[0] for p in parts if p])  # 각 단어의 첫 글자
        return initials[:max_len]

    cat_code = sanitize(category_name, 2)
    brand_code = sanitize(brand_name, 4)
    product_code = get_initials(product_name, 4)

    option_parts = []
    for opt in options:
        val = f"{opt.value}{opt.unit or ''}"
        option_parts.append(str(val).replace(" ", "").upper())

    option_str = "-".join(option_parts)

    return f"{cat_code}-{brand_code}-{product_code}-{option_str}"

