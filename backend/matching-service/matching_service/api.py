from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from structlog import get_logger

from .common import Difficulty
from .config import settings
from .grpc import query_num_questions

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


"""
Sample gRPC use

NOTE
- it should NOT be an API endpoint
- in `/match` endpoint, check that the combination given by user is valid (ie `num_questions > 0`)
    - if it is valid, proceed to publish to queues to find matches
    - else, return an error code for frontend to handle/ display
"""


@app.get("/test")
async def test():
    num_questions = query_num_questions(topic="dynamic-programming", difficulty=Difficulty.Hard)
    return {"message": num_questions}
