from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from redis import Redis
from structlog import get_logger

from matching_service.common import MatchRequest
from matching_service.config import RedisSettings

from .config import settings

logger = get_logger()

# Initialize FastAPI app
app = FastAPI(
    title="Matching Service Backend",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the Redis client
redis_client = Redis.from_url("redis://localhost:6379/0")


def request_match(publisher: Redis, user: MatchRequest):
    channel = RedisSettings.Channels.REQUESTS.value
    publisher.publish(channel, user.model_dump_json())
    logger.info(f"CLIENT: User {user.user} requested match for {user.topic}, {user.difficulty}")


@app.get("/")
async def get_match():
    """
    Example GET endpoint for basic testing.
    """
    return {"message": "Hello from matching service"}


@app.post("/match", response_model=dict)
async def create_match(req: MatchRequest):
    """
    Create a match request for a user. This will publish the match request to the Redis channel.
    """
    try:
        # Publish the match request to the Redis channel using the request_match function
        request_match(redis_client, req)

        # Return a success response
        return {"message": f"Match request for {req.user} has been created successfully."}
    except Exception as e:
        logger.error(f"Error while creating match: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while creating the match.")
