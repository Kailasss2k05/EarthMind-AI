"""
GET /api/v1/history — Read-only API for query history.

This module exposes endpoints for clients to retrieve previously
executed sustainability queries and their statuses.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.logger import logger
from app.services.postgres import get_db
from app.services.history import history_service
from app.schemas.history import HistoryListResponse

router = APIRouter()

@router.get(
    "/history",
    response_model=HistoryListResponse,
    summary="List combined query and report history",
    description="Returns a paginated list of all combined history records, ordered by newest first.",
)
def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    query: Optional[str] = Query(None),
    sort: str = Query("desc"),
    db: Session = Depends(get_db)
) -> HistoryListResponse:
    """
    Fetch all history records (queries and reports) combined.
    """
    logger.info("Fetching combined history list")
    
    total, items = history_service.get_combined_history(
        db=db, skip=skip, limit=limit, query_str=query, sort=sort
    )
    
    return HistoryListResponse(
        total=total,
        items=items
    )
