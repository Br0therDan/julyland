from fastapi import APIRouter
from .apps import router as apps_router
from .users import router as users_router
from .subscriptions import router as subscription_router

router = APIRouter()

router.include_router(users_router)
router.include_router(apps_router)
router.include_router(subscription_router)
