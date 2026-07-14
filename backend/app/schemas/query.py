"""
Pydantic schemas for the Query API.

These models define the public contract for:
    POST /api/v1/query

Keeping schemas in a dedicated module decouples the HTTP layer from
orchestration internals so both can evolve independently.
"""

from uuid import UUID
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
    request_id     : Unique identifier for this request (for tracing / logging).
    status         : Execution status — always "completed" on the happy path.
    planner_output : Structured plan produced by the Planner agent.
    """

    request_id: UUID
    status: str
    planner_output: str
