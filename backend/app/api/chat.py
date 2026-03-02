from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.chat import ChatRequest
from app.services.chat_service import ChatService
from app.services.rag_service import RAGService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/stream")
async def stream_chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # RAG: retrieve relevant chunks if documents are attached
    context_chunks = None
    if request.document_ids:
        rag_service = RAGService(db)
        context_chunks = await rag_service.search_similar(
            query=request.content,
            document_ids=request.document_ids,
            top_k=5,
        )

    chat_service = ChatService(db)

    return StreamingResponse(
        chat_service.stream_response(
            user_id=current_user.id,
            conversation_id=request.conversation_id,
            content=request.content,
            model=request.model or settings.DEFAULT_MODEL,
            context_chunks=context_chunks,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
