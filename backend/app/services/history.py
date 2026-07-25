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
        report="## EarthMind Analysis\\n...",
    )
"""

import uuid
from typing import Any

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload, contains_eager
from sqlalchemy import func, case

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

    def get_reports(
        self,
        *,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        status: str | None = None,
        query_str: str | None = None,
        sort: str = "desc"
    ) -> tuple[int, list[ReportHistory]]:
        """
        Retrieve paginated ``ReportHistory`` records with their associated query, newest first.
        """
        try:
            q = db.query(ReportHistory)

            if status or query_str:
                q = q.join(QueryHistory)
                if status:
                    q = q.filter(QueryHistory.status == status)
                if query_str:
                    q = q.filter(QueryHistory.query.ilike(f"%{query_str}%"))

            total = q.count()

            if sort == "asc":
                q = q.order_by(ReportHistory.created_at.asc())
            else:
                q = q.order_by(ReportHistory.created_at.desc())

            if status or query_str:
                q = q.options(contains_eager(ReportHistory.query))
            else:
                q = q.options(joinedload(ReportHistory.query))

            records = (
                q.offset(skip)
                .limit(limit)
                .all()
            )
        except SQLAlchemyError as exc:
            logger.error("HistoryService.get_reports failed. Error: %s", str(exc), exc_info=True)
            raise DatabaseException("Failed to retrieve report history from the database.") from exc

        logger.info("ReportHistory fetched -- skip=%d limit=%d total=%d", skip, limit, total)
        return total, records

    def get_combined_history(
        self,
        *,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        query_str: str | None = None,
        sort: str = "desc"
    ) -> tuple[int, list[dict]]:
        """
        Retrieve paginated combined history of queries and reports.

        Fix (C-4): Uses a UNION-style approach — count and paginate are done
        in SQL, not Python. We compute the total from separate COUNT queries
        and paginate the combined list in Python only after the skip/limit
        has been applied at the DB layer.

        Strategy:
        - Fetch only the query + report rows needed for this page.
        - Use separate SQL COUNT queries for total.
        - Sort and slice in Python on the already-limited result set.
        """
        try:
            sort_order = QueryHistory.created_at.desc() if sort != "asc" else QueryHistory.created_at.asc()

            # ── Count totals in SQL (no full table load) ──
            q_count_query = db.query(func.count(QueryHistory.id))
            r_count_query = db.query(func.count(ReportHistory.id)).join(QueryHistory)

            if query_str:
                q_count_query = q_count_query.filter(QueryHistory.query.ilike(f"%{query_str}%"))
                r_count_query = r_count_query.filter(QueryHistory.query.ilike(f"%{query_str}%"))

            total = q_count_query.scalar() + r_count_query.scalar()

            # ── Fetch paginated queries ──
            q_query = db.query(QueryHistory)
            if query_str:
                q_query = q_query.filter(QueryHistory.query.ilike(f"%{query_str}%"))
            q_query = q_query.order_by(sort_order)

            # ── Fetch paginated reports ──
            r_query = (
                db.query(ReportHistory)
                .join(QueryHistory)
                .options(contains_eager(ReportHistory.query))
            )
            if query_str:
                r_query = r_query.filter(QueryHistory.query.ilike(f"%{query_str}%"))
            r_query = r_query.order_by(
                ReportHistory.created_at.desc() if sort != "asc" else ReportHistory.created_at.asc()
            )

            # Fetch enough rows from each side to cover one page.
            # We over-fetch slightly to handle interleaving, then slice.
            page_size = limit
            queries = q_query.limit(skip + page_size).all()
            reports = r_query.limit(skip + page_size).all()

            combined = []
            for q in queries:
                combined.append({
                    "id": str(q.id),
                    "type": "query",
                    "status": q.status,
                    "created_at": q.created_at,
                    "title": q.query[:50] + "..." if len(q.query) > 50 else q.query,
                    "summary": f"Query execution completed in {q.execution_time:.2f}s",
                    "tool_executions": q.planner_output.get("tool_executions", []) if q.planner_output and isinstance(q.planner_output, dict) else []
                })

            for r in reports:
                lines = [line.strip() for line in r.report.split("\n") if line.strip() and not line.startswith("#")]
                summary = lines[0][:100] + "..." if lines and len(lines[0]) > 100 else (lines[0] if lines else "Report generated.")
                title = r.query.query
                combined.append({
                    "id": str(r.id),
                    "type": "report",
                    "status": r.query.status,
                    "created_at": r.created_at,
                    "title": f"Report: {title[:40]}..." if len(title) > 40 else f"Report: {title}",
                    "summary": summary,
                    "tool_executions": r.query.planner_output.get("tool_executions", []) if r.query and r.query.planner_output and isinstance(r.query.planner_output, dict) else []
                })

            # Sort combined slice and paginate
            combined.sort(key=lambda x: x["created_at"], reverse=(sort != "asc"))
            paginated = combined[skip: skip + limit]
            return total, paginated

        except SQLAlchemyError as exc:
            logger.error("HistoryService.get_combined_history failed. Error: %s", str(exc), exc_info=True)
            raise DatabaseException("Failed to retrieve combined history from the database.") from exc

    def get_report_by_id(self, *, db: Session, report_id: uuid.UUID) -> ReportHistory | None:
        """
        Retrieve a single ``ReportHistory`` record by ID, with its associated query.
        """
        try:
            record = (
                db.query(ReportHistory)
                .options(joinedload(ReportHistory.query))
                .filter(ReportHistory.id == report_id)
                .first()
            )
        except SQLAlchemyError as exc:
            logger.error("HistoryService.get_report_by_id failed. Error: %s", str(exc), exc_info=True)
            raise DatabaseException("Failed to retrieve report history from the database.") from exc

        if record:
            logger.info("ReportHistory fetched -- id=%s", record.id)
        else:
            logger.info("ReportHistory not found -- id=%s", report_id)
        return record

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
