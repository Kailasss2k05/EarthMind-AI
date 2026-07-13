from langchain_ollama import ChatOllama
from app.config.settings import settings


def get_llm():
    return ChatOllama(
        model=settings.MODEL_NAME,
        base_url=settings.OLLAMA_BASE_URL,
        temperature=0.3,
    )