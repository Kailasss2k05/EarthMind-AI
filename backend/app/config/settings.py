from dotenv import load_dotenv
import os

# Load environment variables from backend/.env
load_dotenv()


class Settings:

    # ===========================
    # App
    # ===========================
    APP_NAME = os.getenv("APP_NAME", "EarthMind AI")
    APP_VERSION = os.getenv("APP_VERSION", "0.1.0")
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"

    # ===========================
    # Server
    # ===========================
    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", 8000))

    # ===========================
    # Ollama
    # ===========================
    MODEL_NAME = os.getenv("MODEL_NAME", "llama3.2:3b")
    OLLAMA_BASE_URL = os.getenv(
        "OLLAMA_BASE_URL",
        "http://localhost:11434"
    )
    TEMPERATURE = float(os.getenv("TEMPERATURE", 0.3))

    # ===========================
    # PostgreSQL
    # ===========================
    POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", 5432))
    POSTGRES_DB = os.getenv("POSTGRES_DB", "earthmind")
    POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")

    # ===========================
    # Redis
    # ===========================
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

    # ===========================
    # ChromaDB
    # ===========================
    CHROMA_DB_PATH = os.getenv(
        "CHROMA_DB_PATH",
        "../data/vector_store"
    )

    # ===========================
    # Agent Settings
    # ===========================
    MAX_ITERATIONS = int(os.getenv("MAX_ITERATIONS", 10))
    TOP_K = int(os.getenv("TOP_K", 5))

    # ===========================
    # WebSocket
    # ===========================
    WEBSOCKET_PING_INTERVAL = int(
        os.getenv("WEBSOCKET_PING_INTERVAL", 20)
    )

    # ===========================
    # Frontend
    # ===========================
    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:3000"
    )


settings = Settings()