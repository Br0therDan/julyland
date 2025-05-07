# Path: app/services/store_to_bucket.py

from datetime import timedelta
from minio import Minio
from app.core.config import settings

client = Minio(
    settings.S3_ENDPOINT_URL,
    access_key=settings.S3_ACCESS_KEY_ID,
    secret_key=settings.S3_SECRET_ACCESS_KEY,
    region=settings.S3_REGION,
    secure=False
)


def get_presigned_url(filename: str) -> str:
    return client.presigned_put_object(
        bucket_name=settings.S3_BUCKET,
        object_name=filename,
        expires=timedelta(minutes=10),
    )