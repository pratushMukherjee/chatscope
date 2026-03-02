from pydantic import BaseModel, field_validator

from app.config import settings


class ChatRequest(BaseModel):
    conversation_id: int | None = None
    content: str
    model: str = "gpt-4o"
    document_ids: list[int] = []

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Message cannot be empty")
        if len(v) > settings.MAX_MESSAGE_LENGTH:
            raise ValueError(f"Message too long (max {settings.MAX_MESSAGE_LENGTH} chars)")
        return v
