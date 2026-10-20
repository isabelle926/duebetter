import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Request,
    Response,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_user,
    get_db,
)
from app.core.rate_limit import limiter
from app.models.user import User
from app.schemas.auth import UserResponse
from app.schemas.profile import ProfileUpdate
from app.services.images import (
    MAX_AVATAR_SIZE,
    validate_avatar_image,
)
from app.services.storage import (
    delete_object,
    get_public_url,
    upload_object,
)


router = APIRouter(
    prefix="/profile",
    tags=["profile"],
)


@router.patch(
    "",
    response_model=UserResponse,
)
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> User:
    display_name = (
        data.display_name.strip()
    )

    if not display_name:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail="Display name is required",
        )

    current_user.display_name = (
        display_name
    )

    db.commit()
    db.refresh(current_user)

    return current_user


@router.post(
    "/avatar",
    response_model=UserResponse,
)
@limiter.limit("10/hour")
async def upload_avatar(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> User:
    data = await file.read(
        MAX_AVATAR_SIZE + 1
    )

    content_type, extension = (
        validate_avatar_image(data)
    )

    avatar_id = uuid.uuid4()

    new_storage_key = (
        f"users/{current_user.id}/"
        f"avatar/{avatar_id}.{extension}"
    )

    upload_object(
        key=new_storage_key,
        data=data,
        content_type=content_type,
    )

    old_storage_key = (
        current_user.avatar_storage_key
    )

    current_user.avatar_storage_key = (
        new_storage_key
    )

    current_user.avatar_url = (
        get_public_url(
            key=new_storage_key,
        )
    )

    try:
        db.commit()
    except Exception:
        db.rollback()

        delete_object(
            key=new_storage_key,
        )

        raise

    db.refresh(current_user)

    if old_storage_key:
        try:
            delete_object(
                key=old_storage_key,
            )
        except Exception:
            # The database already points at the
            # new avatar. Failure to clean up the
            # old object should not break the
            # successful profile update.
            pass

    return current_user


@router.delete(
    "/avatar",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_avatar(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> Response:
    storage_key = (
        current_user.avatar_storage_key
    )

    current_user.avatar_url = None
    current_user.avatar_storage_key = None

    db.commit()

    if storage_key:
        try:
            delete_object(
                key=storage_key,
            )
        except Exception:
            pass

    return Response(
        status_code=(
            status.HTTP_204_NO_CONTENT
        ),
    )