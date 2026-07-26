"""
settings.py
-----------
Central configuration for EarthMind AI.

All values are read from environment variables with sensible defaults.
In production, provide all values via a .env file or deployment secrets.

Rules
-----
• Every attribute is defined EXACTLY ONCE.
• DATABASE_URL has a default so startup never crashes when .env is absent.
• REDIS_URL is the canonical Redis connection string.
"""

import os
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv()


class Settings:

    # ===========================
    # App
    # ===========================
    APP_NAME: str = os.getenv("APP_NAME", "EarthMind AI")
    APP_VERSION: str = os.getenv("APP_VERSION", "0.1.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    # ===========================
    # Server
    # ===========================
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", 8000))

    # ===========================
    # Groq / LLM
    # ===========================
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    MODEL_NAME: str = os.getenv("MODEL_NAME", "openai/gpt-oss-20b")
    TEMPERATURE: float = float(os.getenv("TEMPERATURE", 0))

    # ===========================
    # PostgreSQL
    # ===========================
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", 5432))
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "earthmind")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")

    # DATABASE_URL has an explicit fallback so the app never crashes
    # on import when .env is absent (e.g. CI, fresh Docker container).
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/earthmind",
    )

    # ===========================
    # Redis
    # ===========================
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    # REDIS_URL is the canonical connection string; preferred over host+port.
    REDIS_URL: str = os.getenv(
        "REDIS_URL",
        f"redis://{os.getenv('REDIS_HOST', 'localhost')}:{os.getenv('REDIS_PORT', '6379')}",
    )

    # ===========================
    # ChromaDB
    # ===========================
    CHROMA_DB_PATH: str = os.getenv("CHROMA_DB_PATH", "../data/vector_store")

    # ===========================
    # Agent Settings
    # ===========================
    MAX_ITERATIONS: int = int(os.getenv("MAX_ITERATIONS", 10))
    TOP_K: int = int(os.getenv("TOP_K", 5))

    # ===========================
    # WebSocket
    # ===========================
    WEBSOCKET_PING_INTERVAL: int = int(os.getenv("WEBSOCKET_PING_INTERVAL", 20))

    # ===========================
    # CORS / Frontend
    # ===========================
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    _raw_origins: str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,"
        "http://127.0.0.1:3000,"
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:8080,"
        "http://127.0.0.1:8080",
    )
    ALLOWED_ORIGINS: list[str] = [
        origin.strip() for origin in _raw_origins.split(",") if origin.strip()
    ]


    # ===========================
    # Document Upload
    # ===========================
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", 25))


settings = Settings()