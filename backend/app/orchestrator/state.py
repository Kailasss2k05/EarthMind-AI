from typing import TypedDict, List, Dict, Optional

class GraphState(TypedDict):
    query: str

    planner_output: Optional[str]
    research_output: Optional[str]
    sdg_output: Optional[str]
    policy_output: Optional[str]
    environmental_output: Optional[str]
    finance_output: Optional[str]
    risk_output: Optional[str]
    timeline_output: Optional[str]
    report_output: Optional[str]

    required_agents: List[str]