from langchain_ollama import ChatOllama

from app.config.settings import settings


def get_llm():
    """
    Returns the configured LLM for standard agents.
    """

    if settings.MODEL_PROVIDER == "ollama":
        return ChatOllama(
            model=settings.MODEL_NAME,
            base_url=settings.OLLAMA_BASE_URL,
            temperature=settings.TEMPERATURE,
        )

    raise ValueError(f"Unsupported provider: {settings.MODEL_PROVIDER}")


def get_planner_llm():
    """
    Returns an LLM instance with Ollama's native JSON mode enabled.

    Using ``format='json'`` activates grammar-constrained decoding at the
    tokenizer level, making it physically impossible for the model to emit
    anything other than a valid JSON object.  This is the most reliable way
    to stop a small model (e.g. llama3.2:3b) from generating code or prose
    instead of the expected JSON response.
    """

    if settings.MODEL_PROVIDER == "ollama":
        return ChatOllama(
            model=settings.MODEL_NAME,
            base_url=settings.OLLAMA_BASE_URL,
            temperature=settings.TEMPERATURE,
            format="json",
        )

    raise ValueError(f"Unsupported provider: {settings.MODEL_PROVIDER}")