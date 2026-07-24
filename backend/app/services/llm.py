from langchain_ollama import ChatOllama

from app.config.settings import settings


def get_llm(json_mode: bool = True):
    """
    Returns the configured LLM.

    json_mode=True  -> Used by Planner, Research, SDG, Policy, etc.
    json_mode=False -> Used by ReportAgent.
    """

    if settings.MODEL_PROVIDER != "ollama":
        raise ValueError(
            f"Unsupported provider: {settings.MODEL_PROVIDER}"
        )

    kwargs = {
        "model": settings.MODEL_NAME,
        "base_url": settings.OLLAMA_BASE_URL,
        "temperature": 0,
    }

    if json_mode:
        kwargs["format"] = "json"

    return ChatOllama(**kwargs)