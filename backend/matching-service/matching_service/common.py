import time
from enum import Enum

from pydantic import BaseModel, computed_field

from .config import settings


class Difficulty(Enum):
    Easy = "Easy"
    Medium = "Medium"
    Hard = "Hard"


class MatchRequest(BaseModel):
    """
    Represents a MatchRequest from client

    Required fields:
    - user (ObjectId or email)
    - difficulty
    - topic

    Automatically creates
    - created_at timestamp (in seconds)
    - expire_at timestamp (in seconds)
    """

    user: str = ...
    difficulty: Difficulty
    topic: str = ...

    @computed_field
    @property
    def created_at(self) -> float:
        return time.time()

    @computed_field
    @property
    def expire_at(self) -> float:
        return self.created_at + settings.MATCH_TIMEOUT

    def get_key(self) -> str:
        return f"{self.difficulty.value}:{self.topic}"
