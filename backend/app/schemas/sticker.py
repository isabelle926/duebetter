import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StickerResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    storage_key: str
    image_url: str
    created_at: datetime