from app.services.llm import get_llm


llm = get_llm()


def planner_agent(query: str) -> str:
    """
    Planner Agent

    Breaks the user's sustainability query into
    structured implementation steps.
    """

    prompt = f"""
You are the Planner Agent of EarthMind AI.

Your job is to convert the user's sustainability idea into
an implementation plan.

Return ONLY the following sections.

1. Objectives

2. Required Resources

3. Stakeholders

4. Timeline Overview

5. Possible Risks

User Query:

{query}
"""

    response = llm.invoke(prompt)

    return response.content