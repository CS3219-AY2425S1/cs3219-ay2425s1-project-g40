"""
Loading env vars from .env files for FastAPI
https://fastapi.tiangolo.com/advanced/settings/

If env vars are not supplied by a .env file,
default values defined in the class are used

Defining env vars with `export` in terminal overrides
env file values
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()
this_file = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(this_file, os.pardir))
ENV_PATH = Path(PROJECT_ROOT) / ".env"


class Settings(BaseSettings):
    QUESTION_DB_URL: str = "mongodb://localhost:27017"
    DB_NAME: str = "questions_db"
    COLLECTION_NAME: str = "questions"
    ORIGINS: list[str] = ["http://localhost", "http://localhost:3000"]

    class Config:
        env_file = ENV_PATH
        env_ignore_empty = (True,)
        extra = "ignore"


settings = Settings()
