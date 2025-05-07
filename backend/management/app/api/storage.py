import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
from mypy_boto3_s3 import S3Client

S3_BUCKET = settings.S3_BUCKET
S3_REGION = settings.S3_REGION
S3_ENDPOINT_URL = settings.S3_ENDPOINT_URL  # 필요시


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,  # MinIO 서버 주소
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        # region_name=settings.S3_REGION,
    )


def get_presigned_url(file_name: str, mime_type: str, expiration: int = 3600) -> str:
    """
    파일 업로드를 위한 Presigned URL을 발급합니다.

    :param file_name: 업로드할 파일의 이름 (Key)
    :param mime_type: 파일의 MIME 타입 (예: "image/jpeg", "video/mp4")
    :param expiration: Presigned URL의 유효 시간(초), 기본값은 3600초 (1시간)
    :return: Presigned URL 문자열
    :raises ClientError: URL 발급에 실패한 경우 발생
    """
    s3_client: S3Client = get_s3_client()
    try:
        response = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": S3_BUCKET,
                "Key": file_name,
                "ContentType": mime_type,
            },
            ExpiresIn=expiration,
        )
    except ClientError as e:
        raise e
    return response
