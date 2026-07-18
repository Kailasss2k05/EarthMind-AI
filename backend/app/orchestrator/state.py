from typing import TypedDict, Optional, Dict, List


class GraphState(TypedDict):

    # User Query
    query: str

    # Planner
    planner_output: Optional[Dict]

    # Agent Outputs
    research_output: Optional[str]
    sdg_output: Optional[str]
    policy_output: Optional[str]
    environmental_output: Optional[str]
    finance_output: Optional[str]
    risk_output: Optional[str]
    timeline_output: Optional[str]
    report_output: Optional[str]

    # Planner Routing
    required_agents: List[str]
    execution_order: List[str]

    # Runtime
    agent_status: Dict[str, str]
    errors: Dict[str, str]