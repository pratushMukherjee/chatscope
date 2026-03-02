from datetime import datetime

from pydantic import BaseModel


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    model: str | None
    token_count: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageListResponse(BaseModel):
    messages: list[MessageResponse]
    has_more: bool
