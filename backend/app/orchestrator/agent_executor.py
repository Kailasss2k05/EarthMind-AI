"""
agent_executor.py — Reusable agent execution helper.

Eliminates the boilerplate try/except + broadcast pattern that would
otherwise be copy-pasted into every LangGraph node.

Single Responsibility: run one agent function with full lifecycle broadcasting.

Usage (in any node file):
    from app.orchestrator.agent_executor import execute_agent

    def research_node(state):
        return execute_agent(
            agent_name="Research",
            agent_function=research_agent,
            state=state,
            output_key="research_output",
        )
"""

import asyncio
from typing import Callable

from app.websocket.events import (
    broadcast_agent_started,
    broadcast_agent_completed,
    broadcast_agent_failed,
)


def execute_agent(
    *,
    agent_name: str,
    agent_function: Callable[[str], str],
    state: dict,
    query_key: str = "query",
    output_key: str,
) -> dict:
    """
    Execute an agent function with full WebSocket lifecycle broadcasting.

    Parameters
    ----------
    agent_name      : Human-readable name sent in every broadcast event
                      (e.g. "Planner", "Research", "Finance").
    agent_function  : A callable that accepts a single string (the query)
                      and returns a string result.
    state           : LangGraph state dict — must contain `query_key`.
    query_key       : Key used to read the input query from state.
                      Defaults to "query".
    output_key      : Key under which the agent result is written to state.

    Lifecycle
    ---------
    1. Read   state[query_key]
    2. Emit   agent_started
    3. Call   agent_function(query)
    4. Write  state[output_key] = result
    5. Emit   agent_completed
       ↳ on exception:
    5. Emit   agent_failed(reason=str(exc))
    6. Re-raise so LangGraph error handling remains intact.

    Notes
    -----
    LangGraph nodes are synchronous; asyncio.run() bridges the gap to the
    async broadcaster. When the graph is migrated to async nodes, replace
    asyncio.run(fn(...)) with await fn(...) and add `async def` to callers.
    """

    query = state[query_key]

    # ── Step 1: Notify connected clients that the agent has started ──────────
    asyncio.run(broadcast_agent_started(agent_name))

    try:
        # ── Step 2: Execute the agent's business logic (caller-supplied) ─────
        result = agent_function(query)

        # ── Step 3: Persist the result into the shared state dict ────────────
        state[output_key] = result

        # ── Step 4: Notify clients of successful completion ──────────────────
        asyncio.run(broadcast_agent_completed(agent_name))

    except Exception as exc:
        # ── Step 5: Notify clients of failure, then let LangGraph handle it ──
        asyncio.run(broadcast_agent_failed(agent_name, str(exc)))
        raise

    return state
