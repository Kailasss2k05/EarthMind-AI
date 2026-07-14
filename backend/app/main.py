from fastapi import FastAPI
from app.api.router import root_router
from app.core.lifespan import lifespan

app = FastAPI(
    title="EarthMind AI API",
    description="Multi-Agent Sustainability Intelligence Platform",
    version="0.1.0",
    lifespan=lifespan
)

# Single router inclusion: root_router delegates to versioned routers (v1, v2, ...).
# All routes are accessible under /api/v{n}/... prefixes.
app.include_router(root_router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to EarthMind AI 🚀"
    }