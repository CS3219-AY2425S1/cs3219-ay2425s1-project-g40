import structlog
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from redis import Redis, RedisError
from structlog import get_logger

from matching_service.common import MatchRequest
from matching_service.config import RedisSettings

from .common import Difficulty
from .config import Channels, settings
from .grpc import query_num_questions

import json

structlog.configure(
    processors=[
        structlog.processors.add_log_level,
        structlog.dev.ConsoleRenderer(),
    ]
)

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
match_request_redis_url = RedisSettings.redis_url(Channels.REQUESTS)
redis_client = Redis.from_url(match_request_redis_url)

def request_match(publisher: Redis, user: MatchRequest):
    channel = Channels.REQUESTS.value
    publisher.publish(channel, user.model_dump_json())
    logger.info(f"CLIENT: User {user.user} requested match for {user.topic}, {user.difficulty}")

# Endpoint to query matches for a user
@app.get("/matches/{user_id}")
async def get_matches(user_id: str):
    pattern_user = f"match:{user_id}:*"
    pattern_other = f"match:*:{user_id}"
    matches = []
    try:
        cursor = '0'
        patterns = [pattern_user, pattern_other]
        while cursor != 0:
            for pattern in patterns:
                cursor, match_keys = redis_client.scan(cursor=cursor, match=pattern)
                for key in match_keys:
                    match_data = redis_client.get(key)
                    if match_data:
                        matches.append(json.loads(match_data))
        
        if not matches:
            return {"message": "No matches found"}
        return {"matches": matches}
    except RedisError as e:
        logger.error(f"Error while retrieving matches for {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred while retrieving matches."
        )



@app.get("/")
async def get_match():
    """
    Example GET endpoint for basic testing.
    """
    return {"message": "Hello from matching service"}


@app.get("/test")
async def test():
    num_questions = query_num_questions(topic="dynamic-programming", difficulty=Difficulty.Hard)
    return {"message": num_questions}


@app.post("/match", response_model=dict)
async def create_match(req: MatchRequest):
    """
    Create a match request for a user. This will publish the match request to the Redis channel.
    """
    num_questions = query_num_questions(topic=req.topic, difficulty=req.difficulty)
    if num_questions <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No questions for requested match.")
    try:
        # Publish the match request to the Redis channel using the request_match function
        request_match(redis_client, req)

        # Return a success response
        return {"message": f"Match request for {req.user} has been created successfully."}
    except Exception as e:
        logger.error(f"Error while creating match: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred while creating the match."
        )
