from typing import TypedDict, Optional, Dict, Any

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

    next_step: Optional[str]
    retry_count: int

    agent_status: Dict[str, str]
    errors: Dict[str, str]