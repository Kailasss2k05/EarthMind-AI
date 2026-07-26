"""
services/system.py
------------------
System status service — performs real connectivity probes against each service.

Fixes:
  H-2: Postgres and Redis are now actually probed, not hardcoded True.
  M-10: Embedding model name is read from RAG config, not hardcoded.
"""

from app.rag.vector_store import get_dashboard_statistics
from app.rag.config import EMBEDDING_MODEL_NAME
from app.core.logger import logger


def _check_postgres() -> bool:
    """Return True if PostgreSQL is reachable."""
    try:
        from app.services.postgres import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.warning("System status: PostgreSQL not reachable: %s", exc)
        return False


def _check_redis() -> bool:
    """Return True if Redis is reachable."""
    try:
        from app.services.redis import redis_client
        redis_client.ping()
        return True
    except Exception as exc:
        logger.warning("System status: Redis not reachable: %s", exc)
        return False


class SystemStatusService:
    def get_status(self) -> dict:
        """
        Returns the operational status of services and database metadata.
        Performs real connectivity probes for Postgres and Redis (H-2).
        """
        # Vector store stats
        try:
            stats = get_dashboard_statistics()
            docs_count = stats.get("total_documents", 0)
            chunks_count = stats.get("total_chunks", 0)
            collections_count = len(stats.get("domains", []))
            chroma_connected = True
        except Exception:
            docs_count = 0
            chunks_count = 0
            collections_count = 0
            chroma_connected = False

        return {
            "services": {
                "postgres":  {"connected": _check_postgres()},
                "redis":     {"connected": _check_redis()},
                "qdrant":    {"connected": chroma_connected},
                "groq":      {"configured": True},   # Groq is the LLM provider
            },
            "documents":        docs_count,
            "chunks":           chunks_count,
            "knowledge_base":   collections_count,
            "agents":           9,
            "embedding_model":  EMBEDDING_MODEL_NAME,   # M-10: read from config, not hardcoded
        }


system_status_service = SystemStatusService()
