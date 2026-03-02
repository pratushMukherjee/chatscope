import hashlib
import logging

from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.document import Document, DocumentStatus
from app.models.document_chunk import DocumentChunk
from app.utils.pdf_parser import extract_text_from_pdf
from app.utils.text_splitter import RecursiveTextSplitter

logger = logging.getLogger("chatscope")


class DocumentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.splitter = RecursiveTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
        )

    async def process_document(
        self, document_id: int, file_content: bytes, filename: str
    ):
        result = await self.db.get(Document, document_id)
        if not result:
            return

        document = result
        try:
            document.status = DocumentStatus.PROCESSING
            await self.db.commit()

            # 1. Extract text
            if filename.lower().endswith(".pdf"):
                text = extract_text_from_pdf(file_content)
            else:
                text = file_content.decode("utf-8")

            if not text.strip():
                raise ValueError("No text content found in document")

            document.content_hash = hashlib.sha256(text.encode()).hexdigest()
            document.char_count = len(text)

            # 2. Split into chunks
            chunks = self.splitter.split_text(text)

            if not chunks:
                raise ValueError("Document produced no text chunks")

            # 3. Generate embeddings in batches
            batch_size = 100
            all_chunks = []

            for i in range(0, len(chunks), batch_size):
                batch = chunks[i: i + batch_size]

                response = await self.client.embeddings.create(
                    model=settings.EMBEDDING_MODEL,
                    input=batch,
                    dimensions=settings.EMBEDDING_DIMENSIONS,
                )

                for j, embedding_data in enumerate(response.data):
                    chunk = DocumentChunk(
                        document_id=document_id,
                        chunk_index=i + j,
                        content=batch[j],
                        embedding=embedding_data.embedding,
                    )
                    self.db.add(chunk)
                    all_chunks.append(chunk)

            document.status = DocumentStatus.READY
            document.chunk_count = len(all_chunks)
            await self.db.commit()

            logger.info(
                f"Document {document_id} processed: {len(all_chunks)} chunks"
            )

        except Exception as e:
            logger.error(f"Document {document_id} processing failed: {e}")
            document.status = DocumentStatus.ERROR
            document.error_message = str(e)
            await self.db.commit()
