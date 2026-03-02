import json
import logging

from openai import AsyncOpenAI
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.conversation import Conversation
from app.models.message import Message
from app.utils.token_counter import count_tokens

logger = logging.getLogger("chatscope")


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def get_or_create_conversation(
        self, conversation_id: int | None, user_id: int, model: str
    ) -> Conversation:
        if conversation_id:
            result = await self.db.execute(
                select(Conversation).where(
                    Conversation.id == conversation_id,
                    Conversation.user_id == user_id,
                )
            )
            conversation = result.scalar_one_or_none()
            if not conversation:
                raise ValueError("Conversation not found")
            return conversation

        conversation = Conversation(user_id=user_id, model=model)
        self.db.add(conversation)
        await self.db.flush()
        return conversation

    async def _get_conversation_history(
        self, conversation_id: int, limit: int
    ) -> list[Message]:
        result = await self.db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        messages = list(result.scalars().all())
        messages.reverse()
        return messages

    async def _generate_title(self, user_msg: str, assistant_msg: str) -> str:
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "Generate a short title (max 6 words) for this conversation. Return only the title, no quotes.",
                    },
                    {"role": "user", "content": user_msg},
                    {"role": "assistant", "content": assistant_msg[:200]},
                ],
                max_tokens=20,
            )
            return response.choices[0].message.content.strip()
        except Exception:
            return user_msg[:50]

    async def stream_response(
        self,
        user_id: int,
        conversation_id: int | None,
        content: str,
        model: str,
        context_chunks: list | None = None,
    ):
        try:
            # Get or create conversation
            conversation = await self.get_or_create_conversation(
                conversation_id, user_id, model
            )

            # Save user message
            user_message = Message(
                conversation_id=conversation.id,
                role="user",
                content=content,
                token_count=count_tokens(content, model),
            )
            self.db.add(user_message)
            await self.db.flush()

            # Send conversation_id to frontend
            yield f"data: {json.dumps({'type': 'conversation', 'conversation_id': conversation.id})}\n\n"

            # Build message history
            history = await self._get_conversation_history(
                conversation.id, settings.MAX_CONTEXT_MESSAGES
            )

            system_prompt = self._build_system_prompt(context_chunks)
            messages = [
                {"role": "system", "content": system_prompt},
                *[{"role": m.role, "content": m.content} for m in history],
            ]

            # Stream from OpenAI
            full_response = ""
            yield f"data: {json.dumps({'type': 'start'})}\n\n"

            stream = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True,
                max_tokens=2048,
            )

            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    text = chunk.choices[0].delta.content
                    full_response += text
                    yield f"data: {json.dumps({'type': 'content', 'text': text})}\n\n"

            # Save assistant message
            assistant_message = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=full_response,
                model=model,
                token_count=count_tokens(full_response, model),
            )
            self.db.add(assistant_message)

            # Auto-generate title for new conversations
            if not conversation.title:
                conversation.title = await self._generate_title(content, full_response)

            await self.db.commit()

            yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_message.id, 'title': conversation.title})}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error(f"Chat stream error: {e}", exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

    def _build_system_prompt(self, context_chunks: list | None = None) -> str:
        base = (
            "You are ChatScope, an AI research assistant. "
            "Be helpful, accurate, and concise. "
            "Format responses using Markdown for readability. "
            "Use code blocks with language tags for code."
        )
        if context_chunks:
            context_text = "\n\n".join(
                [
                    f"[Source: {c.document.filename}, chunk {c.chunk_index}]\n{c.content}"
                    for c in context_chunks
                ]
            )
            base += (
                f"\n\nUse the following document context to answer. "
                f"Cite which document and section you reference.\n\n"
                f"---CONTEXT---\n{context_text}\n---END CONTEXT---"
            )
        return base
