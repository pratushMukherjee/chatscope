import logging

from openai import AsyncOpenAI

from app.config import settings

logger = logging.getLogger("chatscope")


class ModerationService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def check(self, text: str) -> tuple[bool, list[str]]:
        """
        Check text against OpenAI's Moderation API.
        Returns (is_flagged, list_of_flagged_categories).
        """
        if not settings.ENABLE_CONTENT_MODERATION:
            return False, []

        try:
            response = await self.client.moderations.create(
                model="omni-moderation-latest",
                input=text,
            )
            result = response.results[0]

            if not result.flagged:
                return False, []

            flagged_categories = [
                category
                for category, flagged in result.categories.model_dump().items()
                if flagged
            ]

            logger.warning(
                f"Content flagged for: {', '.join(flagged_categories)}"
            )
            return True, flagged_categories

        except Exception as e:
            logger.error(f"Moderation check failed: {e}")
            # Fail open — don't block if moderation service is down
            return False, []
