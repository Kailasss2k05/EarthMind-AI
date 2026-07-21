"""
GET /api/v1/reports — Read-only API for report history.

This module exposes endpoints for clients to retrieve previously
generated sustainability reports.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.logger import logger
from app.services.postgres import get_db
from app.services.history import history_service
from app.schemas.history import (
    ReportHistoryListResponse,
    ReportHistoryItem,
    ReportDetailResponse
)

from typing import Optional

router = APIRouter(tags=["Reports"])

@router.get(
    "/reports",
    response_model=ReportHistoryListResponse,
    summary="List all generated reports",
    description="Returns a paginated list of all report history records, ordered by newest first.",
)
def get_reports_list(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    status: Optional[str] = Query(None, description="Filter by query status"),
    query: Optional[str] = Query(None, description="Filter by query content (case-insensitive)"),
    sort: str = Query("desc", description="Sort order by created_at: 'asc' or 'desc'"),
    db: Session = Depends(get_db)
) -> ReportHistoryListResponse:
    """
    Fetch paginated report history records.
    """
    logger.info("Fetching report history list")
    
    total, records = history_service.get_reports(db=db, skip=skip, limit=limit, status=status, query_str=query, sort=sort)
    
    items = [
        ReportHistoryItem(
            id=r.id,
            query_id=r.query_id,
            original_query=r.query.query,
            status=r.query.status,
            created_at=r.created_at
        )
        for r in records
    ]
    
    return ReportHistoryListResponse(
        total=total,
        items=items
    )

@router.get(
    "/reports/{report_id}",
    response_model=ReportDetailResponse,
    summary="Get report details",
    description="Returns detailed information for a specific report, including the generated report content.",
)
def get_report_detail(
    report_id: UUID,
    db: Session = Depends(get_db)
) -> ReportDetailResponse:
    """
    Fetch a single report by its ID.
    """
    logger.info("Fetching report details for id=%s", report_id)
    
    record = history_service.get_report_by_id(db=db, report_id=report_id)
    if not record:
        logger.warning("Report not found: id=%s", report_id)
        raise HTTPException(status_code=404, detail="Report not found")
        
    return ReportDetailResponse(
        id=record.id,
        query_id=record.query_id,
        original_query=record.query.query,
        report=record.report,
        planner_output=record.query.planner_output,
        execution_time=record.query.execution_time,
        confidence=record.query.confidence,
        status=record.query.status,
        created_at=record.created_at
    )
