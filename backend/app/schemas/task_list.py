import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskListCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100,
    )
    color: str = Field(
        pattern=r"^#[0-9A-Fa-f]{6}$",
    )
    position: int = Field(
        default=0,
        ge=0,
    )


class TaskListUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    color: str | None = Field(
        default=None,
        pattern=r"^#[0-9A-Fa-f]{6}$",
    )
    position: int | None = Field(
        default=None,
        ge=0,
    )


class TaskListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    color: str
    position: int
    created_at: datetime
    updated_at: datetime