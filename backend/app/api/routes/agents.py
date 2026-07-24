from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.logger import logger
from app.services.postgres import get_db
from app.services.agents import agent_service
from app.schemas.agents import AgentStatusResponse

router = APIRouter(tags=["Agents"])

@router.get(
    "/agents/status",
    response_model=AgentStatusResponse,
    summary="Get Agent Status",
    description="Returns the operational status and execution metrics for all agents."
)
def get_agent_status(db: Session = Depends(get_db)):
    """
    Fetch agent status and statistics.
    """
    logger.info("Fetching agent status")
    return agent_service.get_agent_status(db=db)
