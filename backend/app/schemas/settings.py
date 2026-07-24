from pydantic import BaseModel
from typing import Dict

class SettingsConfigured(BaseModel):
    postgres: bool
    chromadb: bool
    redis: bool
    watsonx: bool

class SettingsResponse(BaseModel):
    organisation: str
    region: str
    notification_defaults: Dict[str, bool]
    configured: SettingsConfigured
