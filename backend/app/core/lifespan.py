from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import text
from app.services.postgres import engine
from app.services.redis import redis_client
from app.core.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Starting up EarthMind AI Backend...")
    
    # Verify PostgreSQL connection
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Successfully connected to PostgreSQL.")
    except Exception as e:
        logger.error(f"Failed to connect to PostgreSQL on startup: {e}")
        
    # Verify Redis connection
    try:
        redis_client.ping()
        logger.info("Successfully connected to Redis.")
    except Exception as e:
        logger.error(f"Failed to connect to Redis on startup: {e}")

    yield  # Application runs here
    
    # Shutdown actions
    logger.info("Shutting down EarthMind AI Backend...")
    
    # Close PostgreSQL connection cleanly
    try:
        engine.dispose()
        logger.info("PostgreSQL connection closed cleanly.")
    except Exception as e:
        logger.error(f"Error closing PostgreSQL connection: {e}")
        
    # Close Redis connection cleanly
    try:
        redis_client.close()
        logger.info("Redis connection closed cleanly.")
    except Exception as e:
        logger.error(f"Error closing Redis connection: {e}")
