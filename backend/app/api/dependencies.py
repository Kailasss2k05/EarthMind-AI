"""
api/dependencies.py
-------------------
Shared FastAPI dependency functions for the EarthMind AI backend.

Keeping dependencies in a dedicated module prevents circular imports
between routers and services.
"""

from fastapi import Depends
from redis import Redis

from app.services.redis import get_redis


def get_redis_client(redis: Redis = Depends(get_redis)) -> Redis:
    """FastAPI dependency — injects the shared Redis client."""
    return redis
