from collections.abc import Generator
from datetime import datetime, timezone

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_session_token
from app.db.session import SessionLocal
from app.models.session import Session as UserSession
from app.models.user import User


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_current_user(
    session_token: str | None = Cookie(
        default=None,
        alias=settings.session_cookie_name,
    ),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
    )

    if session_token is None:
        raise credentials_error

    token_hash = hash_session_token(session_token)

    statement = select(UserSession).where(
        UserSession.token_hash == token_hash,
    )

    user_session = db.scalar(statement)

    if user_session is None:
        raise credentials_error

    now = datetime.now(timezone.utc)

    if user_session.expires_at <= now:
        db.delete(user_session)
        db.commit()

        raise credentials_error

    user = db.get(User, user_session.user_id)

    if user is None:
        raise credentials_error

    return user