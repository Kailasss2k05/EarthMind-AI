from fastapi import APIRouter
from app.api.routes import health
from app.websocket.routes import ws_router

# Versioned router: all routes under /api/v1
# To add a new version, create app/api/v2/router.py with its own prefix="/api/v2"
# and include it in the root router (app/api/router.py).
v1_router = APIRouter(prefix="/api/v1")

# Register all v1 route modules here.
# Future routes (e.g., chat, agents) should be added below in the same pattern.
v1_router.include_router(health.router, tags=["Health"])

# WebSocket endpoint: /api/v1/ws
# LangGraph will be wired into this router in a future iteration.
v1_router.include_router(ws_router, tags=["WebSocket"])
