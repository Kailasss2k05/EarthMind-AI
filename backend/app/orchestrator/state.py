from typing import TypedDict, Optional


class GraphState(TypedDict):
    """
    Shared state passed between all agents.
    """

    query: str

    planner_output: Optional[str]