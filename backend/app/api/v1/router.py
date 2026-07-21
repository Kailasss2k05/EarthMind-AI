from fastapi import APIRouter
from app.api.routes import health
from app.api.routes import query
from app.websocket.routes import ws_router

# Versioned router: all routes under /api/v1
# To add a new version, create app/api/v2/router.py with its own prefix="/api/v2"
# and include it in the root router (app/api/router.py).
v1_router = APIRouter(prefix="/api/v1")

# Health check — infrastructure connectivity status.
v1_router.include_router(health.router, tags=["Health"])

# Query — single public entry point for multi-agent LangGraph execution.
v1_router.include_router(query.router, tags=["Query"])

# History — read-only API for past queries.
from app.api.routes import history
v1_router.include_router(history.router, tags=["History"])

# WebSocket endpoint: /api/v1/ws
# LangGraph will be wired into this router in a future iteration.
v1_router.include_router(ws_router, tags=["WebSocket"])

# Document Upload — API for adding to the knowledge base.
from app.api.routes import documents
v1_router.include_router(documents.router, tags=["Documents"])

# Reports — read-only API for generated reports.
from app.api.routes import reports
v1_router.include_router(reports.router, tags=["Reports"])
