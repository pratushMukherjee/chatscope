import json
import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.services.moderation_service import ModerationService

logger = logging.getLogger("chatscope")

# Only moderate endpoints that accept user text content
MODERATED_PATHS = ["/api/chat/stream"]


class ContentSafetyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "POST" and request.url.path in MODERATED_PATHS:
            try:
                body = await request.body()
                data = json.loads(body)
                content = data.get("content", "")

                if content:
                    service = ModerationService()
                    is_flagged, categories = await service.check(content)

                    if is_flagged:
                        return JSONResponse(
                            status_code=400,
                            content={
                                "detail": f"Message flagged for: {', '.join(categories)}. Please revise your message."
                            },
                        )
            except (json.JSONDecodeError, UnicodeDecodeError):
                pass

        return await call_next(request)
