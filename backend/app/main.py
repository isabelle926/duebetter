from fastapi import FastAPI

from app.api.routes import (
    auth,
    lists,
    stickers,
    tasks,
)
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

app = FastAPI(
    title="DueBetter API",
    version="0.1.0",
)

app = FastAPI(
    title="DueBetter API",
    version="0.1.0",
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

app.include_router(
    auth.router,
    prefix="/api",
)