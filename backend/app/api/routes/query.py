"""
POST /api/v1/query — Single public entry point for multi-agent execution.

Flow
----
1. Validate the incoming QueryRequest (Pydantic).
2. Generate a UUID request_id for tracing.
3. Log the request_id so it can be correlated with WebSocket events and logs.
4. Invoke the compiled LangGraph pipeline:
       graph.invoke({"query": request.query})
   LangGraph runs each agent node in order (currently: Planner).
   Each node broadcasts WebSocket lifecycle events via execute_agent().
5. Extract planner_output from the returned state.
6. Return a structured QueryResponse.

Future agents (Research, Policy, Finance, etc.) will be added to the graph
and their outputs surfaced here without changing the endpoint contract.
"""

import uuid
from fastapi import APIRouter

from app.orchestrator.graph import graph
from app.schemas.query import QueryRequest, QueryResponse
from app.core.logger import logger

router = APIRouter()


@router.post(
    "/query",
    response_model=QueryResponse,
    summary="Run the EarthMind AI multi-agent pipeline",
    description=(
        "Accepts a sustainability query, runs it through the LangGraph "
        "orchestration pipeline, and returns the structured Planner output."
    ),
)
async def run_query(request: QueryRequest) -> QueryResponse:
    """
    Entry point for all agent execution.

    This endpoint is intentionally thin — all business logic lives
    inside the LangGraph graph and individual agent nodes.
    """

    # Step 1: Generate a unique request ID for end-to-end tracing.
    # The same ID is visible in:
    #   - response body
    #   - server logs
    #   - X-Request-ID response header (added by RequestLoggerMiddleware)
    request_id = uuid.uuid4()
    logger.info("[%s] Query received: %s", request_id, request.query)

    # Step 2: Invoke the LangGraph pipeline.
    # Run the synchronous graph.invoke in a worker thread to prevent blocking
    # the main event loop. This allows WebSocket events to be broadcast in real-time
    # and prevents deadlocks with synchronous blocking operations.
    import asyncio
    result = await asyncio.to_thread(graph.invoke, {"query": request.query})

    logger.info("[%s] Pipeline completed successfully.", request_id)

    # Step 3: Build and return the typed response.
    return QueryResponse(
        request_id=request_id,
        status="completed",
        planner_output=result["planner_output"],
    )
