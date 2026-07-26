"""
GET /api/v1/health — Infrastructure connectivity status.

Checks PostgreSQL, Redis, and Qdrant Cloud.
Returns a consistent JSON envelope with per-service status.
"""

from fastapi import APIRouter
from sqlalchemy import text

from app.services.postgres import engine
from app.services.redis import redis_client
from app.services.qdrant import qdrant_health_check

router = APIRouter()


@router.get("/health")
def health_check():
    health_status = {
        "status": "healthy",
        "services": {
            "postgres": "connected",
            "redis":    "connected",
            "qdrant":   "connected",
        },
    }

    # ── PostgreSQL ────────────────────────────────────────────────────────────
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:
        health_status["services"]["postgres"] = "disconnected"
        health_status["status"] = "unhealthy"

    # ── Redis ─────────────────────────────────────────────────────────────────
    try:
        redis_client.ping()
    except Exception:
        health_status["services"]["redis"] = "disconnected"
        health_status["status"] = "unhealthy"

    # ── Qdrant Cloud ──────────────────────────────────────────────────────────
    if not qdrant_health_check():
        health_status["services"]["qdrant"] = "disconnected"
        health_status["status"] = "unhealthy"

    return health_status
