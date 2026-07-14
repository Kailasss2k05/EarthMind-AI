import time
import uuid
from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logger import logger

class RequestLoggerMiddleware(BaseHTTPMiddleware):
    """
    Middleware responsible for logging incoming HTTP requests.
    
    Responsibilities:
    1. Generates a unique Request ID (UUID) for tracing.
    2. Measures execution duration in milliseconds.
    3. Adds the Request ID to the response headers as 'X-Request-ID'.
    4. Logs request details: method, path, client IP, status code, and duration.
    5. Logs failures if request processing encounters an exception.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())
        
        # Attach the request ID to the request state so it can be accessed by downstream handlers/loggers
        request.state.request_id = request_id
        
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path
        method = request.method
        
        start_time = time.perf_counter()
        
        try:
            response = await call_next(request)
            
            # Calculate duration in milliseconds
            duration_ms = (time.perf_counter() - start_time) * 1000
            
            # Log the request processing details
            logger.info(
                "[%s] %s %s - IP: %s - Status: %d - %.2fms",
                request_id,
                method,
                path,
                client_ip,
                response.status_code,
                duration_ms,
            )
            
            # Append X-Request-ID to response headers
            response.headers["X-Request-ID"] = request_id
            return response
            
        except Exception as e:
            # Calculate duration in milliseconds on failure
            duration_ms = (time.perf_counter() - start_time) * 1000
            
            # Log exception traceback along with the request ID
            logger.exception(
                "[%s] %s %s - IP: %s - Failed - %.2fms - Error: %s",
                request_id,
                method,
                path,
                client_ip,
                duration_ms,
                str(e),
            )
            raise e


def configure_request_logger(app: FastAPI) -> None:
    """
    Registers the RequestLoggerMiddleware with the FastAPI app.
    """
    app.add_middleware(RequestLoggerMiddleware)
