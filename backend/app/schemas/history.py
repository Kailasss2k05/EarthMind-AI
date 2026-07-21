"""
schemas/history.py
------------------
Pydantic schemas for the Query History API.

These models define the public contract for:
    GET /api/v1/history

Keeping schemas in a dedicated module decouples the HTTP layer from
persistence internals so both can evolve independently.

Backend source: app/api/routes/history.py
"""

from datetime import datetime
from uuid import UUID
from typing import List, Optional
from pydantic import BaseModel, Field


class QueryHistoryItem(BaseModel):
    """
    A single query history record returned by GET /api/v1/history.

    Fields mirror the QueryHistory ORM model, exposing only the
    summary fields needed by clients.  Raw planner_output is
    intentionally excluded to keep the response lightweight.
    """

    id: UUID = Field(description="Unique identifier of the query record.")
    query: str = Field(description="The original natural-language query.")
    status: str = Field(description="Execution status, e.g. 'completed'.")
    execution_time: float = Field(description="Wall-clock seconds taken by the pipeline.")
    confidence: Optional[float] = Field(
        default=None,
        description="Aggregate confidence score (0.0 - 1.0), or None if unavailable.",
    )
    created_at: datetime = Field(description="UTC timestamp when the record was created.")

    model_config = {"from_attributes": True}


class QueryHistoryListResponse(BaseModel):
    """
    Envelope returned by GET /api/v1/history.

    Wraps the list of records with a total count so clients can
    paginate or display metadata without counting client-side.
    """

    total: int = Field(description="Total number of query history records returned.")
    items: List[QueryHistoryItem] = Field(
        description="Query history records ordered by newest first.",
    )


class ReportHistoryItem(BaseModel):
    """
    A single report history record returned by GET /api/v1/reports.
    """
    id: UUID = Field(description="Unique identifier of the report record.")
    query_id: UUID = Field(description="Identifier of the associated query.")
    original_query: str = Field(description="The original natural-language query.")
    status: str = Field(description="Execution status, e.g. 'completed'.")
    created_at: datetime = Field(description="UTC timestamp when the report was generated.")

    model_config = {"from_attributes": True}


class ReportHistoryListResponse(BaseModel):
    """
    Envelope returned by GET /api/v1/reports.
    """
    total: int = Field(description="Total number of report history records returned.")
    items: List[ReportHistoryItem] = Field(
        description="Report history records ordered by newest first.",
    )


class ReportDetailResponse(BaseModel):
    """
    Detailed report response returned by GET /api/v1/reports/{report_id}.
    """
    id: UUID = Field(description="Unique identifier of the report record.")
    query_id: UUID = Field(description="Identifier of the associated query.")
    original_query: str = Field(description="The original natural-language query.")
    report: str = Field(description="The full generated markdown report.")
    planner_output: Optional[dict] = Field(description="The JSON output from the planner.")
    execution_time: float = Field(description="Wall-clock seconds taken by the pipeline.")
    confidence: Optional[float] = Field(
        default=None,
        description="Aggregate confidence score.",
    )
    status: str = Field(description="Execution status, e.g. 'completed'.")
    created_at: datetime = Field(description="UTC timestamp when the report was generated.")

    model_config = {"from_attributes": True}
