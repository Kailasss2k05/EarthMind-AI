"""
lifespan.py
-----------
FastAPI application lifespan context manager.

Startup
-------
1. Capture the main event loop for thread-safe WebSocket broadcasting.
2. Verify PostgreSQL connectivity.
3. Verify Redis connectivity.
4. Verify Qdrant Cloud connectivity.

Shutdown
--------
1. Dispose the SQLAlchemy connection pool.
2. Close the Redis connection.
"""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from app.services.postgres import engine
from app.services.redis import redis_client
from app.services.qdrant import qdrant_health_check
from app.core.logger import logger
from app.database import init_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Capture event loop for WebSocket broadcasting ──────────────────────
    from app.websocket.manager import manager
    manager.loop = asyncio.get_running_loop()

    logger.info("Starting up EarthMind AI Backend...")

    # ── PostgreSQL ─────────────────────────────────────────────────────────
    # PostgreSQL
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        logger.info("Successfully connected to PostgreSQL.")

        # Create tables if they don't exist
        init_database()
        logger.info("Database tables initialized successfully.")

    except Exception as e:
        logger.error("Failed to connect to PostgreSQL on startup: %s", e)

    # ── Redis ──────────────────────────────────────────────────────────────
    try:
        redis_client.ping()
        logger.info("Successfully connected to Redis.")
    except Exception as e:
        logger.error("Failed to connect to Redis on startup: %s", e)

    # ── Qdrant Cloud ───────────────────────────────────────────────────────
    try:
        if qdrant_health_check():
            logger.info("Successfully connected to Qdrant Cloud.")
        else:
            logger.warning(
                "Qdrant Cloud is reachable but returned an unexpected result. "
                "Run ingest.py to populate the knowledge base."
            )
    except Exception as e:
        logger.error("Failed to connect to Qdrant Cloud on startup: %s", e)

    yield  # Application runs here

    # ── Shutdown ───────────────────────────────────────────────────────────
    logger.info("Shutting down EarthMind AI Backend...")

    try:
        engine.dispose()
        logger.info("PostgreSQL connection pool closed.")
    except Exception as e:
        logger.error("Error closing PostgreSQL connection: %s", e)

    try:
        redis_client.close()
        logger.info("Redis connection closed.")
    except Exception as e:
        logger.error("Error closing Redis connection: %s", e)
