from openai import AsyncOpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.models.document_chunk import DocumentChunk


class RAGService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def search_similar(
        self,
        query: str,
        document_ids: list[int],
        top_k: int = 5,
    ) -> list[DocumentChunk]:
        # 1. Embed the query
        response = await self.client.embeddings.create(
            model=settings.EMBEDDING_MODEL,
            input=query,
            dimensions=settings.EMBEDDING_DIMENSIONS,
        )
        query_embedding = response.data[0].embedding

        # 2. Vector similarity search using pgvector cosine distance
        stmt = (
            select(DocumentChunk)
            .options(selectinload(DocumentChunk.document))
            .where(DocumentChunk.document_id.in_(document_ids))
            .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))
            .limit(top_k)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
