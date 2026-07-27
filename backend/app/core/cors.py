from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.core.logger import logger


def configure_cors(app: FastAPI) -> None:
    """
    Configures CORS middleware for the FastAPI application.
    
    Configuration Details:
    - allow_origins: Configured origins allowed to make cross-origin requests.
      Reads from Settings.ALLOWED_ORIGINS.
    - allow_credentials: Enabled to allow cookie and credential-backed requests.
    - allow_methods: Explicitly allowed REST methods: GET, POST, PUT, PATCH, DELETE, OPTIONS.
    - allow_headers: Allowed all headers to enable flexibility for custom request headers.
    """
    app.add_middleware(
        CORSMiddleware,
        # Allow origins specified in Settings
        allow_origins=settings.ALLOWED_ORIGINS,
        # Allow cookies and credentials (required for authentication)
        allow_credentials=True,
        # Restrict allowed methods to production standards
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        # Allow all request headers
        allow_headers=["*"],
    )
    logger.info("CORS middleware configured. Allowed origins (%d):", len(settings.ALLOWED_ORIGINS))
    for origin in settings.ALLOWED_ORIGINS:
        logger.info("  → %s", origin)
