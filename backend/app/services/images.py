from io import BytesIO

from fastapi import HTTPException, status
from PIL import Image, UnidentifiedImageError


MAX_STICKER_SIZE = 2 * 1024 * 1024

ALLOWED_FORMATS = {
    "PNG": "image/png",
    "WEBP": "image/webp",
}

MAX_DIMENSION = 2048


def validate_sticker_image(
    data: bytes,
) -> tuple[str, str]:
    if len(data) > MAX_STICKER_SIZE:
        raise HTTPException(
            status_code=(
                status.HTTP_413_CONTENT_TOO_LARGE
            ),
            detail=(
                "Sticker must be 2 MB or smaller"
            ),
        )

    if not data:
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail="Uploaded file is empty",
        )

    try:
        with Image.open(
            BytesIO(data)
        ) as image:
            image.verify()

        with Image.open(
            BytesIO(data)
        ) as image:
            image_format = image.format

            if (
                image_format
                not in ALLOWED_FORMATS
            ):
                raise HTTPException(
                    status_code=(
                        status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
                    ),
                    detail=(
                        "Only PNG and WebP "
                        "stickers are supported"
                    ),
                )

            width, height = image.size

            if (
                width > MAX_DIMENSION
                or height > MAX_DIMENSION
            ):
                raise HTTPException(
                    status_code=(
                        status.HTTP_422_UNPROCESSABLE_ENTITY
                    ),
                    detail=(
                        "Sticker dimensions must "
                        "not exceed 2048×2048"
                    ),
                )

            content_type = (
                ALLOWED_FORMATS[image_format]
            )

            extension = (
                "png"
                if image_format == "PNG"
                else "webp"
            )

            return content_type, extension

    except UnidentifiedImageError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
            ),
            detail="File is not a valid image",
        ) from exc