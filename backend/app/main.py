from fastapi import FastAPI

from app.api.routes import lists, tasks


app = FastAPI(
    title="DueBetter API",
    version="0.1.0",
)


app.include_router(
    lists.router,
    prefix="/api",
)

app.include_router(
    tasks.router,
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