"""
CORS middleware configuration for EarthMind AI.

Origins are read from ALLOWED_ORIGINS in .env (comma-separated).
If not set, development defaults are used so local frontends work out of the box.

Registration: call register_cors(app) inside main.py before include_router().
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.core.logger import logger


def register_cors(app: FastAPI) -> None:
    """
    Add CORSMiddleware to the FastAPI application.

    Configuration rationale
    -----------------------
    allow_origins       – Explicit list from settings; never use ["*"] in production
                          because it cannot be combined with allow_credentials=True.
    allow_credentials   – Required for cookie-based auth and Authorization headers
                          sent by browsers.
    allow_methods       – Full REST surface: GET, POST, PUT, PATCH, DELETE + OPTIONS
                          (OPTIONS is mandatory for pre-flight requests).
    allow_headers       – ["*"] lets the browser send any custom header
                          (e.g. Authorization, X-Request-ID, Content-Type).
    """

    app.add_middleware(
        CORSMiddleware,

        # Allowed origins parsed from settings (comma-separated env var or defaults).
        allow_origins=settings.ALLOWED_ORIGINS,

        # Allow cookies and Authorization headers to be forwarded cross-origin.
        allow_credentials=True,

        # Standard REST HTTP methods plus OPTIONS for CORS pre-flight.
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

        # Allow all request headers (browser will still enforce its own security rules).
        allow_headers=["*"],
    )

    logger.info("CORS middleware registered for origins: %s", settings.ALLOWED_ORIGINS)
