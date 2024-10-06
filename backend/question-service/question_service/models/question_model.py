from enum import Enum

from beanie import Document

from ..config import settings


class Difficulty(Enum):
    Easy = "Easy"
    Medium = "Medium"
    Hard = "Hard"


class Question(Document):
    title: str
    titleSlug: str
    difficulty: Difficulty
    description: str
    topic: str

    class Settings:
        name = settings.COLLECTION_NAME

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Two Sum",
                "titleSlug": "two-sum",
                "difficulty": "easy",
                "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                "topic": "Array",
            }
        }
