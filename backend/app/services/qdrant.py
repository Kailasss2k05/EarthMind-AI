"""
services/qdrant.py
------------------
Qdrant Cloud client singleton — replaces app/services/chromadb.py.

Provides a single shared QdrantClient instance reused across all RAG
operations.  The client is created lazily on the first call so startup
is fast even when Qdrant is not yet reachable.

Usage
-----
    from app.services.qdrant import get_qdrant_client, qdrant_health_check
"""

from typing import Any

from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse

from app.core.logger import logger

_client: QdrantClient | None = None


def get_qdrant_client() -> QdrantClient:
    """
    Return (or create) the shared QdrantClient.

    Credentials are read from application settings (which in turn read
    QDRANT_URL and QDRANT_API_KEY from the environment).
    """
    global _client
    if _client is None:
        from app.config.settings import settings

        if not settings.QDRANT_URL:
            raise RuntimeError(
                "QDRANT_URL is not set. "
                "Add it to your .env file before starting the backend."
            )

        _client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY or None,
            timeout=30,
        )
        logger.info("Qdrant client initialised → %s", settings.QDRANT_URL)

    return _client


def qdrant_health_check() -> bool:
    """
    Return ``True`` if Qdrant Cloud is reachable, ``False`` otherwise.

    Used by the ``/health`` endpoint and the lifespan startup routine.
    """
    try:
        client = get_qdrant_client()
        # list_collections() is a lightweight operation that exercises the client.
        client.get_collections()
        return True
    except Exception as exc:
        logger.warning("Qdrant health check failed: %s", exc)
        return False
