from fastapi import FastAPI

app = FastAPI(
    title="DueBetter API",
    version="0.1.0",
)


@app.get("/")
def root():
    return {"message": "DueBetter API is running"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}