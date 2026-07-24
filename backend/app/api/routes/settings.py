from fastapi import APIRouter
from app.core.logger import logger
from app.services.settings import settings_service
from app.schemas.settings import SettingsResponse

router = APIRouter(tags=["Settings"])

@router.get(
    "/settings",
    response_model=SettingsResponse,
    summary="Get application settings",
    description="Returns public configuration details without exposing API keys."
)
def get_settings():
    """
    Fetch public settings.
    """
    logger.info("Fetching application settings")
    return settings_service.get_settings()
