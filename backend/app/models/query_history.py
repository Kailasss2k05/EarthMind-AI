import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, Float, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class QueryHistory(Base):
    __tablename__ = "query_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    query: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    execution_time: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    planner_output: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    # One QueryHistory -> Many ReportHistory
    reports = relationship(
        "ReportHistory",
        back_populates="query",
        cascade="all, delete-orphan",
    )