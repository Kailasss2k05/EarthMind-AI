from pydantic import BaseModel, Field
from typing import Optional

class AgentStatusDetail(BaseModel):
    status: str
    executions: int
    last_run: Optional[str] = None
    average_execution_time: float = 0.0

class AgentStatusResponse(BaseModel):
    planner: AgentStatusDetail
    research: AgentStatusDetail
    policy: AgentStatusDetail
    environmental: AgentStatusDetail
    finance: AgentStatusDetail
    risk: AgentStatusDetail
    timeline: AgentStatusDetail
    report: AgentStatusDetail
