from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PromptTemplate(Base):
    __tablename__ = "prompt_templates"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    template: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(50))
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User | None"] = relationship(back_populates="templates")
