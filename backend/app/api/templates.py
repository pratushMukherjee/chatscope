from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.template import PromptTemplate
from app.schemas.template import TemplateCreate, TemplateResponse, TemplateListResponse

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("", response_model=TemplateListResponse)
async def list_templates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PromptTemplate)
        .where(
            or_(
                PromptTemplate.is_system == True,
                PromptTemplate.user_id == current_user.id,
            )
        )
        .order_by(PromptTemplate.category, PromptTemplate.title)
    )
    templates = list(result.scalars().all())
    return TemplateListResponse(
        templates=[TemplateResponse.model_validate(t) for t in templates]
    )


@router.post("", response_model=TemplateResponse, status_code=201)
async def create_template(
    data: TemplateCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    template = PromptTemplate(
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        template=data.template,
        category=data.category,
        is_system=False,
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template


@router.delete("/{template_id}", status_code=204)
async def delete_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PromptTemplate).where(
            PromptTemplate.id == template_id,
            PromptTemplate.user_id == current_user.id,
            PromptTemplate.is_system == False,
        )
    )
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(404, "Template not found or cannot be deleted")

    await db.delete(template)
    await db.commit()
