from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    ConversationListResponse,
)

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * per_page

    # Get total count
    count_result = await db.execute(
        select(func.count(Conversation.id)).where(
            Conversation.user_id == current_user.id
        )
    )
    total = count_result.scalar()

    # Get conversations with message count
    result = await db.execute(
        select(
            Conversation,
            func.count(Message.id).label("message_count"),
        )
        .outerjoin(Message)
        .where(Conversation.user_id == current_user.id)
        .group_by(Conversation.id)
        .order_by(Conversation.updated_at.desc())
        .offset(offset)
        .limit(per_page)
    )

    conversations = []
    for row in result.all():
        conv = row[0]
        conv_dict = {
            "id": conv.id,
            "title": conv.title,
            "model": conv.model,
            "is_shared": conv.is_shared,
            "share_slug": conv.share_slug,
            "created_at": conv.created_at,
            "updated_at": conv.updated_at,
            "message_count": row[1],
        }
        conversations.append(conv_dict)

    return ConversationListResponse(conversations=conversations, total=total)


@router.post("", response_model=ConversationResponse, status_code=201)
async def create_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conversation = Conversation(
        user_id=current_user.id,
        title=data.title,
        model=data.model,
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return ConversationResponse(
        **{
            "id": conversation.id,
            "title": conversation.title,
            "model": conversation.model,
            "is_shared": conversation.is_shared,
            "share_slug": conversation.share_slug,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at,
            "message_count": 0,
        }
    )


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation, func.count(Message.id).label("message_count"))
        .outerjoin(Message)
        .where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .group_by(Conversation.id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conv = row[0]
    return ConversationResponse(
        **{
            "id": conv.id,
            "title": conv.title,
            "model": conv.model,
            "is_shared": conv.is_shared,
            "share_slug": conv.share_slug,
            "created_at": conv.created_at,
            "updated_at": conv.updated_at,
            "message_count": row[1],
        }
    )


@router.patch("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: int,
    data: ConversationUpdate,
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
        raise HTTPException(status_code=404, detail="Conversation not found")

    if data.title is not None:
        conversation.title = data.title

    await db.commit()
    await db.refresh(conversation)

    count_result = await db.execute(
        select(func.count(Message.id)).where(
            Message.conversation_id == conversation_id
        )
    )
    msg_count = count_result.scalar()

    return ConversationResponse(
        **{
            "id": conversation.id,
            "title": conversation.title,
            "model": conversation.model,
            "is_shared": conversation.is_shared,
            "share_slug": conversation.share_slug,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at,
            "message_count": msg_count,
        }
    )


@router.delete("/{conversation_id}", status_code=204)
async def delete_conversation(
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
        raise HTTPException(status_code=404, detail="Conversation not found")

    await db.delete(conversation)
    await db.commit()
