from typing import TypedDict, Dict, List, Any


class GraphState(TypedDict):
    query: str

    planner_output: dict

    outputs: Dict[str, Any]

    required_agents: List[str]
    execution_order: List[str]

    agent_status: Dict[str, str]
    errors: Dict[str, str]