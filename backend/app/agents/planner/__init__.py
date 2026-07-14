from app.services.llm import get_llm

from app.prompts.planner_prompt import PLANNER_PROMPT

from .agent import PlannerAgent

planner_agent = PlannerAgent()


def planner_agent(query: str) -> str:
    """
    Planner Agent

    Breaks the user's sustainability query into
    structured implementation steps.
    """

    state = {"query": query}
    return planner_agent.run(state)