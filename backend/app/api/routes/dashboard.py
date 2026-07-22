from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.postgres import get_db
from app.services.dashboard import dashboard_service
from app.schemas.dashboard import DashboardStatsResponse

router = APIRouter(tags=["Dashboard"])

@router.get(
    "/dashboard/stats",
    response_model=DashboardStatsResponse,
    summary="Get Dashboard Statistics",
    description="Returns aggregated statistics for queries, reports, and the knowledge base, along with recent activities."
)
def get_dashboard_stats(db: Session = Depends(get_db)) -> DashboardStatsResponse:
    """
    Fetch all metrics and recent history for the main dashboard.
    """
    return dashboard_service.get_statistics(db=db)
