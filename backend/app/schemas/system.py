from pydantic import BaseModel


class ServiceConnection(BaseModel):
    connected: bool


class OllamaConfig(BaseModel):
    configured: bool


class SystemServices(BaseModel):
    postgres: ServiceConnection
    redis: ServiceConnection
    chromadb: ServiceConnection
    ollama: OllamaConfig   # L-4: renamed from watsonx; actual LLM is Ollama


class SystemStatusResponse(BaseModel):
    services: SystemServices
    documents: int
    chunks: int
    knowledge_base: int
    agents: int
    embedding_model: str
