import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.database import engine, Base
from app.api.router import api_router
from app.middleware.rate_limiter import setup_rate_limiter
from app.middleware.error_handler import setup_error_handlers
from app.middleware.request_logging import RequestLoggingMiddleware
from app.middleware.content_safety import ContentSafetyMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: enable pgvector extension, then create tables
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: dispose engine
    await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(
        title="ChatScope API",
        description="AI-powered research assistant API",
        version="1.0.0",
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Middleware (order matters — outermost runs first)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(ContentSafetyMiddleware)
    setup_rate_limiter(app)
    setup_error_handlers(app)

    # Routes
    app.include_router(api_router, prefix="/api")

    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "service": "chatscope"}

    return app


app = create_app()
