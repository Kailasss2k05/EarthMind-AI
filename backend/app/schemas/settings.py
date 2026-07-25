from pydantic import BaseModel
from typing import Dict, Optional


class SettingsConfigured(BaseModel):
    postgres: bool
    chromadb: bool
    redis: bool
    watsonx: bool = False   # L-4: not actually configured; here for UI compatibility


class SettingsResponse(BaseModel):
    organisation: str
    region: str
    notification_defaults: Dict[str, bool]
    configured: SettingsConfigured
