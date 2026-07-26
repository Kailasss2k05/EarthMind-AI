from langchain_groq import ChatGroq

from app.config.settings import settings


def get_llm(json_mode: bool = True) -> ChatGroq:

    if not settings.GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is not configured."
        )

    llm = ChatGroq(
        model=settings.MODEL_NAME,
        groq_api_key=settings.GROQ_API_KEY,
        temperature=settings.TEMPERATURE,
        timeout=120,
        max_retries=3,
    )

    if json_mode:
        llm = llm.bind(
            response_format={"type": "json_object"}
        )

    return llm