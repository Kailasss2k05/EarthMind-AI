"""
Pydantic schemas for the Query API.

These models define the public contract for:
    POST /api/v1/query

Keeping schemas in a dedicated module decouples the HTTP layer from
orchestration internals so both can evolve independently.

Backend source: app/api/routes/query.py
"""

from uuid import UUID
from typing import Any, Dict, List
from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """Inbound payload: the user's sustainability query."""

    query: str = Field(
        ...,
        min_length=1,
        description="The sustainability question or idea to process.",
        examples=["How can we reduce carbon emissions in urban transport?"],
    )


class QueryResponse(BaseModel):
    """
    Outbound payload returned after the LangGraph pipeline completes.

    Fields
    ------
    request_id          : Unique trace ID (UUID) for logging / correlation.
    status              : Always ``"completed"`` on the happy path.
    query               : Echo of the original query for client convenience.
    planner_output      : Structured plan dict produced by the Planner agent.
    report              : Final Markdown report produced by the Report agent.
    outputs             : Per-agent structured outputs (excluding ``report``).
    agent_status        : Execution status for every agent that ran or was skipped.
    errors              : Error messages for any agent that failed.
    missing_information : Deduplicated list of information gaps across all agents.
    """

    request_id: UUID
    status: str
    query: str

    planner_output: Dict[str, Any] = Field(default_factory=dict)
    report: str = Field(default="")
    outputs: Dict[str, Any] = Field(default_factory=dict)
    agent_status: Dict[str, str] = Field(default_factory=dict)
    errors: Dict[str, str] = Field(default_factory=dict)
    missing_information: List[str] = Field(default_factory=list)
