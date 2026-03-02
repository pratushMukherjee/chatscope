import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.message import MessageResponse

router = APIRouter(tags=["share"])


@router.post("/conversations/{conversation_id}/share")
async def toggle_share(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(404, "Conversation not found")

    if conversation.is_shared:
        conversation.is_shared = False
        conversation.share_slug = None
    else:
        conversation.is_shared = True
        conversation.share_slug = str(uuid.uuid4())[:8]

    await db.commit()
    await db.refresh(conversation)

    return {
        "is_shared": conversation.is_shared,
        "share_slug": conversation.share_slug,
        "share_url": f"/share/{conversation.share_slug}" if conversation.share_slug else None,
    }


@router.get("/share/{slug}")
async def get_shared_conversation(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(
            Conversation.share_slug == slug,
            Conversation.is_shared == True,
        )
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(404, "Shared conversation not found")

    return {
        "title": conversation.title,
        "model": conversation.model,
        "created_at": conversation.created_at.isoformat(),
        "messages": [
            MessageResponse.model_validate(m) for m in conversation.messages
        ],
    }
