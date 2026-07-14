from app.services.llm import get_llm

from app.prompts.planner_prompt import PLANNER_PROMPT

llm = get_llm()


def planner_agent(query: str) -> str:
    """
    Planner Agent

    Breaks the user's sustainability query into
    structured implementation steps.
    """

    prompt = PLANNER_PROMPT.format(query=query)

    response = llm.invoke(prompt)

    return response.content