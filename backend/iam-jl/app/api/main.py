from fastapi import APIRouter
from app.api.routes import (
    auth,
    users,
    utils,
    oauth2,
    subscriptions,
    apps,
    admin,
)

api_router = APIRouter()

# Auth and User Management
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])

# OAuth2
api_router.include_router(oauth2.router, prefix="/auth", tags=["OAuth2"])

# Subscriptions
api_router.include_router(apps.router, prefix="/apps", tags=["Apps"])
api_router.include_router(
    subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"]
)

# Admin
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(utils.router, prefix="/utils", tags=["Utils"])


@api_router.get("/health-check", tags=["Health Check"])
async def health_check() -> bool:
    return True
