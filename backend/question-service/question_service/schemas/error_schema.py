"""
Override default 422 error response model from FastAPI
"""

from pydantic import BaseModel, Field


class Error(BaseModel):
    loc: str
    msg: str


class CustomValidationErrorResponse(BaseModel):
    errors: list[Error] = Field(
        ..., example=[{"loc": "description", "msg": "String should have at least 10 characters"}]
    )
