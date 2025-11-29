"""
Content Quarto settings model for storing both simple and advanced settings
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.common import GUID

if TYPE_CHECKING:
    from datetime import datetime

    from app.models.content import Content


class ContentQuartoSettings(Base):
    """Stores Quarto settings for each content item"""

    __tablename__ = "content_quarto_settings"

    content_id: Mapped[str] = mapped_column(
        GUID(), ForeignKey("contents.id"), primary_key=True, index=True
    )

    # Simple mode settings stored as JSON
    simple_settings: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=dict)

    # Advanced mode YAML
    advanced_yaml: Mapped[str | None] = mapped_column(Text, default=None)

    # Which mode is currently active
    active_mode: Mapped[str] = mapped_column(
        String(20), default="simple"
    )  # 'simple' or 'advanced'

    # Currently selected preset name (for advanced mode)
    active_preset: Mapped[str | None] = mapped_column(String(255), default=None)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now()
    )

    # Relationships
    content: Mapped[Content] = relationship("Content", back_populates="quarto_settings")

    def __repr__(self) -> str:
        return f"<ContentQuartoSettings(content_id={self.content_id}, mode={self.active_mode})>"
