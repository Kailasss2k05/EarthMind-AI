"""
history.py
----------
Persistence service for query and report history.

This module exposes a single HistoryService class that is responsible
for reading and writing QueryHistory and ReportHistory records in
PostgreSQL.  It contains no routing logic and no FastAPI dependencies.

Usage:
    from app.services.history import history_service

    query_record = history_service.save_query(
        db=db,
        query="What is the carbon footprint of ...",
        planner_output={"steps": [...]},
        execution_time=1.23,
        status="success",
        confidence=0.95,
    )

    report_record = history_service.save_report(
        db=db,
        query_id=query_record.id,
        report="## EarthMind Analysis\n...",
    )
"""

import uuid
from typing import Any

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.exceptions import DatabaseException
from app.core.logger import logger
from app.models.query_history import QueryHistory
from app.models.report_history import ReportHistory


class HistoryService:
    """
    Service class responsible for persisting query and report history
    into PostgreSQL via SQLAlchemy ORM sessions.

    This class is intentionally free of FastAPI routing logic.  It
    accepts an injected Session so that the caller (e.g. a route
    handler or background task) controls the session lifecycle.
    """

    # ------------------------------------------------------------------
    # Read
    # ------------------------------------------------------------------

    def get_query_history(self, *, db: Session) -> list[QueryHistory]:
        """
        Retrieve all ``QueryHistory`` records, newest first.

        Parameters
        ----------
        db:
            An active SQLAlchemy ``Session``.

        Returns
        -------
        list[QueryHistory]
            All persisted query records ordered by ``created_at`` descending.

        Raises
        ------
        DatabaseException
            Wraps any ``SQLAlchemyError`` encountered during the query.
        """
        try:
            records = (
                db.query(QueryHistory)
                .order_by(QueryHistory.created_at.desc())
                .all()
            )
        except SQLAlchemyError as exc:
            logger.error(
                "HistoryService.get_query_history failed. Error: %s",
                str(exc),
                exc_info=True,
            )
            raise DatabaseException(
                "Failed to retrieve query history from the database."
            ) from exc

        logger.info("QueryHistory fetched -- total=%d records.", len(records))
        return records

    # ------------------------------------------------------------------
    # Write
    # ------------------------------------------------------------------

    def save_query(
        self,
        *,
        db: Session,
        query: str,
        planner_output: dict[str, Any] | None,
        execution_time: float,
        status: str,
        confidence: float | None,
    ) -> QueryHistory:
        """
        Persist a completed pipeline query to the ``query_history`` table.

        Parameters
        ----------
        db:
            An active SQLAlchemy ``Session``.  The caller retains
            ownership of the session lifecycle (open / close).
        query:
            The raw natural-language query string submitted by the user.
        planner_output:
            JSON-serialisable dict produced by the planner agent, or
            ``None`` if the planner did not execute.
        execution_time:
            Wall-clock seconds elapsed during pipeline execution.
        status:
            Short status label, e.g. ``"success"``, ``"partial"``, or
            ``"error"``.
        confidence:
            Aggregate confidence score (0.0 - 1.0) returned by the
            pipeline, or ``None`` if unavailable.

        Returns
        -------
        QueryHistory
            The newly created and database-refreshed ORM instance.

        Raises
        ------
        DatabaseException
            Wraps any ``SQLAlchemyError`` that occurs during the
            commit; the transaction is rolled back before raising.
        """
        record = QueryHistory(
            query=query,
            planner_output=planner_output,
            execution_time=execution_time,
            status=status,
            confidence=confidence,
        )

        try:
            db.add(record)
            db.commit()
            db.refresh(record)

        except SQLAlchemyError as exc:
            db.rollback()
            logger.error(
                "HistoryService.save_query failed -- rolling back. Error: %s",
                str(exc),
                exc_info=True,
            )
            raise DatabaseException(
                "Failed to persist query history to the database."
            ) from exc

        logger.info(
            "QueryHistory saved -- id=%s  status=%s  execution_time=%.3fs",
            record.id,
            record.status,
            record.execution_time,
        )
        return record

    # ------------------------------------------------------------------

    def save_report(
        self,
        *,
        db: Session,
        query_id: uuid.UUID,
        report: str,
    ) -> ReportHistory:
        """
        Persist a generated report to the ``report_history`` table.

        Parameters
        ----------
        db:
            An active SQLAlchemy ``Session``.
        query_id:
            UUID of the parent ``QueryHistory`` record.  A foreign-key
            constraint enforces referential integrity in PostgreSQL.
        report:
            Markdown-formatted report string produced by the reporter
            agent.

        Returns
        -------
        ReportHistory
            The newly created and database-refreshed ORM instance.

        Raises
        ------
        DatabaseException
            Wraps any ``SQLAlchemyError`` that occurs during the
            commit; the transaction is rolled back before raising.
        """
        record = ReportHistory(
            query_id=query_id,
            report=report,
        )

        try:
            db.add(record)
            db.commit()
            db.refresh(record)

        except SQLAlchemyError as exc:
            db.rollback()
            logger.error(
                "HistoryService.save_report failed -- rolling back. "
                "query_id=%s  Error: %s",
                query_id,
                str(exc),
                exc_info=True,
            )
            raise DatabaseException(
                "Failed to persist report history to the database."
            ) from exc

        logger.info(
            "ReportHistory saved -- id=%s  query_id=%s",
            record.id,
            record.query_id,
        )
        return record


# ---------------------------------------------------------------------------
# Module-level singleton -- import this wherever persistence is needed.
# ---------------------------------------------------------------------------
history_service = HistoryService()
