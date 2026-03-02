from datetime import datetime

from pydantic import BaseModel


class TemplateCreate(BaseModel):
    title: str
    description: str
    template: str
    category: str


class TemplateResponse(BaseModel):
    id: int
    title: str
    description: str
    template: str
    category: str
    is_system: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TemplateListResponse(BaseModel):
    templates: list[TemplateResponse]
