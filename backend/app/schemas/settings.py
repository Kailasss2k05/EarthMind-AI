from pydantic import BaseModel
from typing import Dict, Optional


class SettingsConfigured(BaseModel):
    postgres: bool
    qdrant: bool
    redis: bool
    groq: bool = True   # Groq is the configured LLM provider


class SettingsResponse(BaseModel):
    organisation: str
    region: str
    notification_defaults: Dict[str, bool]
    configured: SettingsConfigured
