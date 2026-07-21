"""
GET /api/v1/history — Read-only API for query history.

This module exposes endpoints for clients to retrieve previously
executed sustainability queries and their statuses.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.services.postgres import get_db
from app.services.history import history_service
from app.schemas.history import QueryHistoryListResponse

router = APIRouter()


@router.get(
    "/history",
    response_model=QueryHistoryListResponse,
    summary="List all executed queries",
    description="Returns a list of all query history records, ordered by newest first.",
)
def get_query_history(db: Session = Depends(get_db)) -> QueryHistoryListResponse:
    """
    Fetch all query history records.
    """
    logger.info("Fetching query history list")
    
    # Retrieve records using the service
    records = history_service.get_query_history(db=db)
    
    # Build and return the response envelope
    return QueryHistoryListResponse(
        total=len(records),
        items=records
    )
