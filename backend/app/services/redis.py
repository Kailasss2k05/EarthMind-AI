"""
services/redis.py
-----------------
Redis client singleton.

Uses ``REDIS_URL`` as the canonical connection string so password,
TLS, and other URL-encoded options are automatically respected.
Falls back to constructing the URL from REDIS_HOST + REDIS_PORT
when REDIS_URL is not explicitly set (handled in settings.py).
"""

import redis as redis_lib

from app.config.settings import settings


redis_client = redis_lib.from_url(
    settings.REDIS_URL,
    decode_responses=True,
)


def get_redis() -> redis_lib.Redis:
    """FastAPI dependency that returns the shared Redis client."""
    return redis_client