from fastapi import APIRouter
from sqlalchemy import text
from app.services.postgres import engine
from app.services.redis import redis_client

router = APIRouter()

@router.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "services": {
            "postgres": "connected",
            "redis": "connected",
            "ollama": "connected",
            "chromadb": "connected"
        }
    }

    # Check PostgreSQL
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:
        health_status["services"]["postgres"] = "disconnected"
        health_status["status"] = "unhealthy"

    # Check Redis
    try:
        redis_client.ping()
    except Exception:
        health_status["services"]["redis"] = "disconnected"
        health_status["status"] = "unhealthy"

    return health_status

