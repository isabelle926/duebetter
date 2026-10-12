from datetime import datetime, timedelta, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    Response,
    status,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.core.config import settings
from app.core.security import (
    generate_session_token,
    hash_password,
    hash_session_token,
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


def set_session_cookie(
    response: Response,
    token: str,
) -> None:
    max_age = settings.session_lifetime_days * 24 * 60 * 60

    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        max_age=max_age,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        path="/",
    )


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    normalized_email = data.email.lower()

    existing_user = db.scalar(
        select(User).where(
            User.email == normalized_email,
        )
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        email=normalized_email,
        password_hash=hash_password(data.password),
        display_name=data.display_name,
    )

    db.add(user)
    db.flush()

    token = generate_session_token()

    user_session = UserSession(
        user_id=user.id,
        token_hash=hash_session_token(token),
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=settings.session_lifetime_days),
    )

    db.add(user_session)
    db.commit()
    db.refresh(user)

    set_session_cookie(response, token)

    return user


@router.post(
    "/login",
    response_model=UserResponse,
)
def login(
    data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    normalized_email = data.email.lower()

    user = db.scalar(
        select(User).where(
            User.email == normalized_email,
        )
    )

    if user is None or not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = generate_session_token()

    user_session = UserSession(
        user_id=user.id,
        token_hash=hash_session_token(token),
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=settings.session_lifetime_days),
    )

    db.add(user_session)
    db.commit()

    set_session_cookie(response, token)

    return user


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user


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
        token_hash = hash_session_token(token)

        user_session = db.scalar(
            select(UserSession).where(
                UserSession.token_hash == token_hash,
            )
        )

        if user_session is not None:
            db.delete(user_session)
            db.commit()

    response.delete_cookie(
        key=settings.session_cookie_name,
        path="/",
        secure=settings.secure_cookies,
        httponly=True,
        samesite="lax",
    )

    response.status_code = status.HTTP_204_NO_CONTENT

    return response