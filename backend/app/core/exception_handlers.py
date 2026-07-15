"""
Global exception handlers for EarthMind AI.

Each handler:
- Logs the error using the central logger (no tracebacks exposed to clients).
- Returns a consistent JSON envelope: { success, error, status }.

Registration: call register_exception_handlers(app) inside main.py.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import (
    EarthMindException,
    DatabaseException,
    AgentException,
    ValidationException,
)
from app.core.logger import logger


def _error_response(message: str, status_code: int) -> JSONResponse:
    """Build the standard error envelope."""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": message,
            "status": status_code,
        },
    )


# ---------------------------------------------------------------------------
# Custom EarthMind exception handlers
# ---------------------------------------------------------------------------

async def earthmind_exception_handler(
    request: Request, exc: EarthMindException
) -> JSONResponse:
    """Handle any EarthMindException (and its subclasses) uniformly."""
    logger.error(
        "[%s] %s %s → %s (status=%d)",
        type(exc).__name__,
        request.method,
        request.url.path,
        exc.message,
        exc.status_code,
    )
    return _error_response(exc.message, exc.status_code)


async def database_exception_handler(
    request: Request, exc: DatabaseException
) -> JSONResponse:
    logger.error(
        "[DatabaseException] %s %s → %s",
        request.method,
        request.url.path,
        exc.message,
    )
    return _error_response(exc.message, exc.status_code)


async def agent_exception_handler(
    request: Request, exc: AgentException
) -> JSONResponse:
    logger.error(
        "[AgentException] %s %s → %s",
        request.method,
        request.url.path,
        exc.message,
    )
    return _error_response(exc.message, exc.status_code)


async def validation_exception_handler(
    request: Request, exc: ValidationException
) -> JSONResponse:
    logger.warning(
        "[ValidationException] %s %s → %s",
        request.method,
        request.url.path,
        exc.message,
    )
    return _error_response(exc.message, exc.status_code)


# ---------------------------------------------------------------------------
# FastAPI / Starlette built-in exception handlers
# ---------------------------------------------------------------------------

async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """Override FastAPI's default HTTPException response to match our envelope."""
    logger.warning(
        "[HTTPException] %s %s → %s (status=%d)",
        request.method,
        request.url.path,
        exc.detail,
        exc.status_code,
    )
    return _error_response(str(exc.detail), exc.status_code)


async def request_validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle Pydantic / FastAPI request validation errors (422)."""
    # Summarise errors without exposing internal details
    errors = [
        f"{' → '.join(str(loc) for loc in err['loc'])}: {err['msg']}"
        for err in exc.errors()
    ]
    summary = "; ".join(errors)
    logger.warning(
        "[RequestValidationError] %s %s → %s",
        request.method,
        request.url.path,
        summary,
    )
    return _error_response(f"Request validation failed: {summary}", 422)


async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Catch-all for any unhandled exceptions — never exposes tracebacks."""
    logger.exception(
        "[UnhandledException] %s %s → %s",
        request.method,
        request.url.path,
        str(exc),
    )
    return _error_response("An unexpected internal error occurred.", 500)


# ---------------------------------------------------------------------------
# Registration helper
# ---------------------------------------------------------------------------

def register_exception_handlers(app: FastAPI) -> None:
    """
    Register all global exception handlers on the FastAPI application.
    Call this once inside main.py after creating the app instance.
    """
    # Custom EarthMind exceptions (most specific first)
    app.add_exception_handler(DatabaseException, database_exception_handler)
    app.add_exception_handler(AgentException, agent_exception_handler)
    app.add_exception_handler(ValidationException, validation_exception_handler)
    app.add_exception_handler(EarthMindException, earthmind_exception_handler)

    # Built-in FastAPI / Starlette exceptions
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, request_validation_exception_handler)

    # Catch-all for anything else
    app.add_exception_handler(Exception, unhandled_exception_handler)

    logger.info("Global exception handlers registered.")
