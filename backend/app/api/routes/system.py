from fastapi import APIRouter
from app.core.logger import logger
from app.services.system import system_status_service
from app.schemas.system import SystemStatusResponse

router = APIRouter(tags=["System"])

@router.get(
    "/system/status",
    response_model=SystemStatusResponse,
    summary="Get System Status",
    description="Returns the operational status of services and high-level knowledge counts."
)
def get_system_status():
    """
    Fetch system status and service connectivity.
    """
    logger.info("Fetching system status")
    return system_status_service.get_status()
