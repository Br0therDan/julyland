# path: app/core/database.py
import logging
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app import models
from app.core.config import settings

logger = logging.getLogger()

mongo_db_uri = settings.MONGODB_URL


async def initiate_database():
    client = AsyncIOMotorClient(str(mongo_db_uri), uuidRepresentation="standard")
    await init_beanie(
        database=client.get_default_database(), document_models=models.__all__
    )
