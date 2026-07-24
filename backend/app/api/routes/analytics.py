from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.services.postgres import get_db
from app.services.analytics import analytics_service
from app.schemas.analytics import AnalyticsResponse

router = APIRouter(tags=["Analytics"])

@router.get(
    "/analytics",
    response_model=AnalyticsResponse,
    summary="Get Analytics",
    description="Returns time-series and aggregated statistics for the analytics dashboard."
)
def get_analytics(db: Session = Depends(get_db)):
    """
    Fetch analytics data.
    """
    logger.info("Fetching analytics data")
    return analytics_service.get_analytics(db=db)
