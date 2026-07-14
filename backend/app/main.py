from fastapi import FastAPI

app = FastAPI(
    title="EarthMind AI API",
    description="Multi-Agent Sustainability Intelligence Platform",
    version="0.1.0"
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to EarthMind AI 🚀"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "EarthMind AI Backend"
    }