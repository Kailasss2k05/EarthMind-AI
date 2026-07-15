from fastapi import FastAPI
from app.api.router import root_router
from app.core.lifespan import lifespan
from app.core.exception_handlers import register_exception_handlers
from app.core.cors import configure_cors
from app.core.request_logger import configure_request_logger

app = FastAPI(
    title="EarthMind AI API",
    description="Multi-Agent Sustainability Intelligence Platform",
    version="0.1.0",
    lifespan=lifespan
)

# Register global exception handlers (custom + built-in overrides).
# Keeps all handler logic out of main.py for clean separation of concerns.
register_exception_handlers(app)

# Register CORS middleware.
configure_cors(app)

# Register Request Logger middleware.
configure_request_logger(app)

# Single router inclusion: root_router delegates to versioned routers (v1, v2, ...).
# All routes are accessible under /api/v{n}/... prefixes.
app.include_router(root_router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to EarthMind AI 🚀"
    }