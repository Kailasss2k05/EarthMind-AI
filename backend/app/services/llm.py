from langchain_ollama import ChatOllama

from app.config.settings import settings


def get_llm():

    """
    Returns the configured LLM.
    """

    if settings.MODEL_PROVIDER == "ollama":

        return ChatOllama(

            model=settings.MODEL_NAME,

            base_url=settings.OLLAMA_BASE_URL,

            temperature=settings.TEMPERATURE

        )

    raise ValueError(

        f"Unsupported provider: {settings.MODEL_PROVIDER}"

    )