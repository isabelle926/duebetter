import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    list_id: uuid.UUID

    title: str = Field(
        min_length=1,
        max_length=255,
    )

    description: str | None = None

    due_date: date

    position: int = Field(
        default=0,
        ge=0,
    )


class TaskUpdate(BaseModel):
    list_id: uuid.UUID | None = None

    sticker_id: uuid.UUID | None = None

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    description: str | None = None

    due_date: date | None = None

    completed: bool | None = None

    position: int | None = Field(
        default=None,
        ge=0,
    )


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    list_id: uuid.UUID
    sticker_id: uuid.UUID | None

    title: str
    description: str | None
    due_date: date
    completed: bool
    position: int

    created_at: datetime
    updated_at: datetime