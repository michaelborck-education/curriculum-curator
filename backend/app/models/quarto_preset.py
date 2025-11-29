"""
Quarto preset model for storing user's YAML templates
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.common import GUID

if TYPE_CHECKING:
    from app.models.user import User


class QuartoPreset(Base):
    """User's saved Quarto YAML presets"""

    __tablename__ = "quarto_presets"

    id: Mapped[str] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4, index=True
    )
    user_id: Mapped[str] = mapped_column(
        GUID(), ForeignKey("users.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    yaml_content: Mapped[str] = mapped_column(Text, nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now()
    )

    # Relationships
    user: Mapped[User] = relationship("User", back_populates="quarto_presets")

    def __repr__(self) -> str:
        return f"<QuartoPreset(id={self.id}, user_id={self.user_id}, name={self.name})>"
