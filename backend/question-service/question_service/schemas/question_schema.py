from typing import Optional

from pydantic import BaseModel, Field, computed_field, field_validator

from ..models import Difficulty


class UpdateQuestionModel(BaseModel):
    description: Optional[str] = Field(default=None, min_length=10)
    difficulty: Optional[Difficulty] = None
    topic: Optional[str] = Field(default=None, min_length=1, max_length=30, pattern=r"^[a-zA-Z0-9 \-]+$")

    class Config:
        require_by_default = False
        json_schema_extra = {
            "example": {
                "description": "New description of the question",
                "difficulty": "Medium",
                "topic": "dynamic-programming",
            }
        }

    @field_validator("topic")
    @classmethod
    def validate_topic(cls, v: str) -> str:
        return _slugify(v)


class CreateQuestionModel(BaseModel):
    title: str = Field(min_length=1, max_length=20, pattern=r"^[a-zA-Z0-9 ]+$")
    description: str = Field(min_length=10)
    difficulty: Difficulty
    topic: str = Field(min_length=1, max_length=30, pattern=r"^[a-zA-Z0-9 \-]+$")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Two Sum",
                "description": "Two Sum problem description",
                "difficulty": "Easy",
                "topic": "array",
            }
        }

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        stripped_title = v.strip()
        if len(stripped_title) == 0:
            raise ValueError("Title cannot be empty")
        return stripped_title

    @field_validator("topic")
    @classmethod
    def validate_topic(cls, v: str) -> str:
        return _slugify(v)

    @computed_field
    @property
    def titleSlug(self) -> str:
        return _slugify(self.title)


def _slugify(s: str) -> str:
    return "-".join(s.lower().strip().split())
