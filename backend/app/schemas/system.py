from pydantic import BaseModel


class ServiceConnection(BaseModel):
    connected: bool


class GroqConfig(BaseModel):
    configured: bool


class SystemServices(BaseModel):
    postgres: ServiceConnection
    redis: ServiceConnection
    chromadb: ServiceConnection
    groq: GroqConfig   # Groq is the LLM provider


class SystemStatusResponse(BaseModel):
    services: SystemServices
    documents: int
    chunks: int
    knowledge_base: int
    agents: int
    embedding_model: str
