"""
database.py
-----------
Database initialization utilities.

This module is responsible for creating all SQLAlchemy tables.
Later, this can be replaced with Alembic migrations without
changing the application startup logic.
"""

from app.models.base import Base

# Import every model so SQLAlchemy registers them
from app.models.query_history import QueryHistory
from app.models.report_history import ReportHistory

from app.services.postgres import engine


def init_database() -> None:
    """
    Initialize all database tables.
    """
    Base.metadata.create_all(bind=engine)