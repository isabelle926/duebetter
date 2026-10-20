from io import BytesIO

from fastapi import HTTPException, status
from PIL import Image, UnidentifiedImageError


MAX_STICKER_SIZE = 2 * 1024 * 1024
MAX_AVATAR_SIZE = 2 * 1024 * 1024

MAX_DIMENSION = 2048

ALLOWED_FORMATS = {
    "PNG": "image/png",
    "WEBP": "image/webp",
}


def _validate_image(
    data: bytes,
    *,
    max_size: int,
    size_error: str,
) -> tuple[str, str]:
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    if len(data) > max_size:
        raise HTTPException(
            status_code=(
                status.HTTP_413_CONTENT_TOO_LARGE
            ),
            detail=size_error,
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

            if image_format not in ALLOWED_FORMATS:
                raise HTTPException(
                    status_code=(
                        status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
                    ),
                    detail=(
                        "Only PNG and WebP images "
                        "are supported"
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
                        "Image dimensions must not "
                        "exceed 2048x2048"
                    ),
                )

            content_type = (
                ALLOWED_FORMATS[
                    image_format
                ]
            )

            extension = (
                "png"
                if image_format == "PNG"
                else "webp"
            )

            return (
                content_type,
                extension,
            )

    except UnidentifiedImageError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
            ),
            detail="File is not a valid image",
        ) from exc


def validate_sticker_image(
    data: bytes,
) -> tuple[str, str]:
    return _validate_image(
        data,
        max_size=MAX_STICKER_SIZE,
        size_error=(
            "Sticker must be 2 MB or smaller"
        ),
    )


def validate_avatar_image(
    data: bytes,
) -> tuple[str, str]:
    return _validate_image(
        data,
        max_size=MAX_AVATAR_SIZE,
        size_error=(
            "Profile picture must be "
            "2 MB or smaller"
        ),
    )