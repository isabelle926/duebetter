from fastapi import FastAPI

from app.api.routes import (
    auth,
    lists,
    profile,
    stickers,
    tasks,
)
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from app.core.logging import configure_logging

from app.middleware.security import (
    SecurityHeadersMiddleware,
)

from fastapi import Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.dependencies import get_db

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import (
    RateLimitExceeded,
)

from app.core.rate_limit import limiter

from app.core.exceptions import (
    unexpected_exception_handler,
)

configure_logging()

app = FastAPI(
    title="DueBetter API",
    version="0.1.0",
)

app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)

app.add_exception_handler(
    Exception,
    unexpected_exception_handler,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.middleware.security import (
    SecurityHeadersMiddleware,
)

app.include_router(
    lists.router,
    prefix="/api",
)

app.include_router(
    tasks.router,
    prefix="/api",
)

app.include_router(
    stickers.router,
    prefix="/api",
)

app.include_router(
    profile.router,
    prefix="/api",
)


@app.get("/")
def root():
    return {
        "message": "DueBetter API is running",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
    }

@app.get("/api/ready")
def readiness_check(
    db: Session = Depends(get_db),
):
    db.execute(
        text("SELECT 1")
    )

    return {
        "status": "ready",
    }

app.include_router(
    auth.router,
    prefix="/api",
)