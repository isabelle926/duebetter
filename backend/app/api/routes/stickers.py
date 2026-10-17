import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Request,
    Response,
    UploadFile,
    status,
)
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_user,
    get_db,
)
from app.core.rate_limit import limiter
from app.models.sticker import Sticker
from app.models.task import Task
from app.models.user import User
from app.schemas.sticker import StickerResponse
from app.services.images import (
    MAX_STICKER_SIZE,
    validate_sticker_image,
)
from app.services.storage import (
    delete_object,
    get_public_url,
    upload_object,
)


router = APIRouter(
    prefix="/stickers",
    tags=["stickers"],
)


MAX_STICKERS_PER_USER = 100


@router.post(
    "",
    response_model=StickerResponse,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("10/minute")
async def upload_sticker(
    request: Request,
    name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> Sticker:
    sticker_name = name.strip()

    if not sticker_name:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail="Sticker name is required",
        )

    if len(sticker_name) > 100:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Sticker name must be "
                "100 characters or fewer"
            ),
        )

    sticker_count_statement = (
        select(
            func.count(Sticker.id)
        )
        .where(
            Sticker.user_id
            == current_user.id
        )
    )

    sticker_count = (
        db.scalar(
            sticker_count_statement
        )
        or 0
    )

    if (
        sticker_count
        >= MAX_STICKERS_PER_USER
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail="Sticker limit reached",
        )

    data = await file.read(
        MAX_STICKER_SIZE + 1
    )

    content_type, extension = (
        validate_sticker_image(data)
    )

    sticker_id = uuid.uuid4()

    storage_key = (
        f"users/{current_user.id}/"
        f"stickers/{sticker_id}.{extension}"
    )

    upload_object(
        key=storage_key,
        data=data,
        content_type=content_type,
    )

    sticker = Sticker(
        id=sticker_id,
        user_id=current_user.id,
        name=sticker_name,
        storage_key=storage_key,
        image_url=get_public_url(
            key=storage_key,
        ),
    )

    db.add(sticker)

    try:
        db.commit()
    except Exception:
        db.rollback()

        delete_object(
            key=storage_key,
        )

        raise

    db.refresh(sticker)

    return sticker


@router.get(
    "",
    response_model=list[StickerResponse],
)
def get_stickers(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> list[Sticker]:
    statement = (
        select(Sticker)
        .where(
            Sticker.user_id
            == current_user.id
        )
        .order_by(
            Sticker.created_at.desc()
        )
    )

    return list(
        db.scalars(statement).all()
    )


@router.delete(
    "/{sticker_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_sticker(
    sticker_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> Response:
    statement = select(
        Sticker
    ).where(
        Sticker.id == sticker_id,
        Sticker.user_id
        == current_user.id,
    )

    sticker = db.scalar(statement)

    if sticker is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Sticker not found",
        )

    tasks_statement = select(
        Task
    ).where(
        Task.sticker_id
        == sticker.id,
        Task.user_id
        == current_user.id,
    )

    tasks = list(
        db.scalars(
            tasks_statement
        ).all()
    )

    for task in tasks:
        task.sticker_id = None

    storage_key = sticker.storage_key

    db.delete(sticker)
    db.commit()

    delete_object(
        key=storage_key,
    )

    return Response(
        status_code=(
            status.HTTP_204_NO_CONTENT
        ),
    )