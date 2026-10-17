import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    Response,
    status,
)
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_user,
    get_db,
)
from app.core.config import settings
from app.core.rate_limit import limiter
from app.core.security import (
    hash_password,
    verify_password,
)
from app.models.session import Session as UserSession
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    UserResponse,
)


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


def hash_session_token(
    token: str,
) -> str:
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def create_session(
    *,
    db: Session,
    user: User,
) -> tuple[str, datetime]:
    token = secrets.token_urlsafe(32)

    token_hash = hash_session_token(
        token
    )

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(
            days=(
                settings.session_lifetime_days
            )
        )
    )

    session = UserSession(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )

    db.add(session)
    db.commit()

    return token, expires_at


def set_session_cookie(
    *,
    response: Response,
    token: str,
) -> None:
    max_age = (
        settings.session_lifetime_days
        * 24
        * 60
        * 60
    )

    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        max_age=max_age,
        httponly=True,
        secure=settings.secure_cookies,
        samesite=(
            settings.session_cookie_samesite
        ),
        path="/",
    )


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("5/minute")
def register(
    request: Request,
    data: RegisterRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    existing_user = db.scalar(
        select(User).where(
            User.email == data.email
        )
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "An account with this "
                "email already exists"
            ),
        )

    user = User(
        email=data.email,
        display_name=data.display_name,
        password_hash=hash_password(
            data.password
        ),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token, _expires_at = (
        create_session(
            db=db,
            user=user,
        )
    )

    set_session_cookie(
        response=response,
        token=token,
    )

    return user


@router.post(
    "/login",
    response_model=UserResponse,
)
@limiter.limit("10/minute")
def login(
    request: Request,
    data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    user = db.scalar(
        select(User).where(
            User.email == data.email
        )
    )

    if (
        user is None
        or not verify_password(
            data.password,
            user.password_hash,
        )
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Invalid email or password"
            ),
        )

    token, _expires_at = (
        create_session(
            db=db,
            user=user,
        )
    )

    set_session_cookie(
        response=response,
        token=token,
    )

    return user


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> Response:
    token = request.cookies.get(
        settings.session_cookie_name
    )

    if token is not None:
        token_hash = hash_session_token(
            token
        )

        db.execute(
            delete(UserSession).where(
                UserSession.token_hash
                == token_hash
            )
        )

        db.commit()

    response.delete_cookie(
        key=settings.session_cookie_name,
        path="/",
        secure=settings.secure_cookies,
        httponly=True,
        samesite=(
            settings.session_cookie_samesite
        ),
    )

    response.status_code = (
        status.HTTP_204_NO_CONTENT
    )

    return response


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(
        get_current_user
    ),
) -> User:
    return current_user