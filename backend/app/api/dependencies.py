from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.session import SessionLocal

import uuid

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

DEV_USER_ID = uuid.UUID(
    "00000000-0000-0000-0000-000000000001"
)


def get_current_user(
    db: Session = Depends(get_db),
) -> User:
    user = db.get(User, DEV_USER_ID)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Development user does not exist",
        )

    return user