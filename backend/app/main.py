from fastapi import FastAPI
from app.api.router import api_router

app = FastAPI(
    title="EarthMind AI API",
    description="Multi-Agent Sustainability Intelligence Platform",
    version="0.1.0"
)

app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to EarthMind AI 🚀"
    }