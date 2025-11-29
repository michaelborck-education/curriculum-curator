"""
Material models with Git-backed content storage
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Any

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.common import GUID

if TYPE_CHECKING:
    from app.models.unit import Unit


class MaterialType(str, Enum):
    """Types of course materials"""

    SYLLABUS = "syllabus"
    LECTURE = "lecture"
    WORKSHEET = "worksheet"
    QUIZ = "quiz"
    LAB = "lab"
    CASE_STUDY = "case_study"
    INTERACTIVE_HTML = "interactive_html"
    READING = "reading"
    VIDEO = "video"
    ASSIGNMENT = "assignment"


class Material(Base):
    """Unit material with version tracking"""

    __tablename__ = "materials"

    id: Mapped[str] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4, index=True
    )
    unit_id: Mapped[str] = mapped_column(
        GUID(), ForeignKey("units.id"), nullable=False, index=True
    )
    week_number: Mapped[int | None] = mapped_column(
        Integer, default=None
    )  # Optional week association

    # Material information
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, default=None)

    # Git-backed content storage
    git_path: Mapped[str] = mapped_column(
        String(500), nullable=False
    )  # e.g., "units/cs101/lecture1.md"
    current_commit: Mapped[str | None] = mapped_column(
        String(40), default=None
    )  # Git commit SHA

    # Cached metadata (for quick access without Git)
    content_summary: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, default=None
    )  # Quick preview/metadata

    # Validation and quality
    validation_results: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, default=None
    )
    quality_score: Mapped[int | None] = mapped_column(Integer, default=None)  # 0-100

    # Generation context
    generation_context: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, default=None
    )  # LLM prompts, settings
    teaching_philosophy: Mapped[str | None] = mapped_column(String(50), default=None)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    unit: Mapped[Unit] = relationship("Unit", back_populates="materials")

    def __repr__(self) -> str:
        return f"<Material(id={self.id}, type='{self.type}', title='{self.title}')>"
