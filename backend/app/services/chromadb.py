"""
services/chromadb.py
--------------------
ChromaDB persistent client singleton.

Provides a single shared ``PersistentClient`` instance reused across
all RAG operations, replacing the per-call ``get_chroma_client()``
pattern in ``rag/vector_store.py``.

Usage
-----
    from app.services.chromadb import get_chroma_client, chroma_health_check
"""

import chromadb
from pathlib import Path

from typing import Any

from app.rag.config import VECTOR_STORE_DIR
from app.core.logger import logger

_client: Any = None


def get_chroma_client() -> Any:
    """
    Return (or create) the shared ChromaDB PersistentClient.

    The database directory is created if it does not exist.
    """
    global _client
    if _client is None:
        VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
        _client = chromadb.PersistentClient(path=str(VECTOR_STORE_DIR))
        logger.info("ChromaDB client initialised at %s", VECTOR_STORE_DIR)
    return _client


def chroma_health_check() -> bool:
    """
    Return ``True`` if ChromaDB is reachable, ``False`` otherwise.

    Used by the ``/health`` endpoint.
    """
    try:
        client = get_chroma_client()
        # list_collections() is a lightweight operation that exercises the client.
        client.list_collections()
        return True
    except Exception as exc:
        logger.warning("ChromaDB health check failed: %s", exc)
        return False
