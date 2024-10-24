"""
Loading env vars from .env files for FastAPI
https://fastapi.tiangolo.com/advanced/settings/

If env vars are not supplied by a .env file,
default values defined in the class are used

Defining env vars with `export` in terminal overrides
env file values
"""

import os
from enum import Enum
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()
this_file = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(this_file, os.pardir))
ENV_PATH = Path(PROJECT_ROOT) / ".env"


class Settings(BaseSettings):
    # Env vars
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    ORIGINS: list[str] = ["http://localhost", "http://localhost:3000"]
    QUESTIONS_GRPC: str = "localhost:50051"
    # Match expiry
    MATCH_TIMEOUT: int = 30

    class Config:
        env_file = ENV_PATH
        env_ignore_empty = (True,)
        extra = "ignore"


settings = Settings()


class Channels(Enum):
    REQUESTS: str = "requests"
    MATCHES: str = "matches"


class RedisSettings:
    db_map = {e.value: i for i, e in enumerate(Channels)}

    def redis_url(chan: Channels) -> str:
        return f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{RedisSettings.db_map[chan.value]}"
