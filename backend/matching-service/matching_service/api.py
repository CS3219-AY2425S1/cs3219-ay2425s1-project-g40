from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from structlog import get_logger

from .config import settings

logger = get_logger()

app = FastAPI(
    title="Matching Service Backend",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    # To update if after auth
    allow_headers=["*"],
)


@app.get("/")
async def index():
    return {"message": "Hello from matching service"}
