from fastapi import APIRouter
from app.api.v1.router import v1_router

# Root router: single entry point included in main.py.
# Each API version gets its own versioned router included here.
# This keeps main.py clean and makes adding /api/v2, /api/v3 trivial.
root_router = APIRouter()

# Include versioned routers.
# To add v2: from app.api.v2.router import v2_router; root_router.include_router(v2_router)
root_router.include_router(v1_router)
