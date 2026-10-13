from io import BytesIO

import boto3
from botocore.client import BaseClient

from app.core.config import settings


def get_r2_client() -> BaseClient:
    return boto3.client(
        "s3",
        endpoint_url=(
            f"https://{settings.r2_account_id}"
            ".r2.cloudflarestorage.com"
        ),
        aws_access_key_id=(
            settings.r2_access_key_id
        ),
        aws_secret_access_key=(
            settings.r2_secret_access_key
        ),
        region_name="auto",
    )


def upload_object(
    *,
    key: str,
    data: bytes,
    content_type: str,
) -> None:
    client = get_r2_client()

    client.upload_fileobj(
        BytesIO(data),
        settings.r2_bucket_name,
        key,
        ExtraArgs={
            "ContentType": content_type,
        },
    )


def delete_object(
    *,
    key: str,
) -> None:
    client = get_r2_client()

    client.delete_object(
        Bucket=settings.r2_bucket_name,
        Key=key,
    )


def get_public_url(
    *,
    key: str,
) -> str:
    base_url = (
        settings.r2_public_url.rstrip("/")
    )

    return f"{base_url}/{key}"