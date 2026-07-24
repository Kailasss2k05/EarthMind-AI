from fastapi import APIRouter
from app.schemas.knowledge_base import KnowledgeBaseResponse
from app.services.knowledge_base import knowledge_base_service
from app.core.logger import logger

router = APIRouter(tags=["Knowledge Base"])

@router.get(
    "/knowledge-base",
    response_model=KnowledgeBaseResponse,
    summary="Get Knowledge Base Statistics",
    description="Returns total documents, chunks, collections info, and recent uploads."
)
def get_knowledge_base():
    """
    Fetch knowledge base statistics and recent uploads.
    """
    logger.info("Fetching knowledge base statistics")
    return knowledge_base_service.get_knowledge_base_stats()
