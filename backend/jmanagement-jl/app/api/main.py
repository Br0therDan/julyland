from fastapi import APIRouter
from app.api.routes import (
    categories,
    brands,
    products,
    variants,
    inventory,
    markets,
    listings,
    rankings,
    media_assets,
)



api_router = APIRouter()


api_router.include_router(categories.router, prefix="/categories", tags=["category"])
api_router.include_router(brands.router, prefix="/brands", tags=["brand"])
api_router.include_router(products.router, prefix="/products", tags=["product"])
api_router.include_router(
    variants.router, prefix="/variants", tags=["variant"]
)
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(markets.router, prefix="/markets", tags=["market"])
api_router.include_router(listings.router, prefix="/listings", tags=["listing"])
api_router.include_router(rankings.router, prefix="/rankings", tags=["ranking"])

api_router.include_router(
    media_assets.router, prefix="/media-assets", tags=["media"]
)