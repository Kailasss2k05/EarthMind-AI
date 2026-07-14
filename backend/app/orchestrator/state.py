from typing import TypedDict, Optional

class GraphState(TypedDict):

    query:str

    planner_output:Optional[str]

    research_output:Optional[str]

    sdg_output:Optional[str]

    policy_output: Optional[str]

    environmental_output: Optional[str]