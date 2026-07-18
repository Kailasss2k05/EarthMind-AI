
import json
import asyncio
from concurrent.futures import Future
from typing import Callable, Coroutine

from app.websocket.events import (
    broadcast_agent_started,
    broadcast_agent_completed,
    broadcast_agent_failed,
)


def _run_async(coro: Coroutine) -> None:
    """
    Run an async coroutine safely and non-blockingly from a synchronous context.

    Uses manager.loop (main event loop captured on startup) to schedule
    the task thread-safely. This prevents blocking worker threads or deadlocking
    the main event loop.
    """
    from app.websocket.manager import manager
    from app.core.logger import logger

    def _done_callback(fut: Future) -> None:
        try:
            fut.result()
        except Exception as e:
            logger.error("Failed to broadcast WebSocket event: %s", str(e))

    # If the main event loop is registered (e.g. uvicorn loop during lifespan),
    # submit the coroutine to it thread-safely and do NOT block.
    if manager.loop and manager.loop.is_running():
        fut = asyncio.run_coroutine_threadsafe(coro, manager.loop)
        fut.add_done_callback(_done_callback)
        return

    # Fallback for CLI/testing environments
    try:
        loop = asyncio.get_running_loop()
        fut = asyncio.run_coroutine_threadsafe(coro, loop)
        fut.add_done_callback(_done_callback)
    except RuntimeError:
        # No running event loop on current thread — run in a new loop
        asyncio.run(coro)


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
    """

    query = state[query_key]

    # ── Step 1: Notify connected clients that the agent has started ──────────
    _run_async(broadcast_agent_started(agent_name))

    try:
        # ── Step 2: Execute the agent's business logic (caller-supplied) ─────
        result = agent_function(query)

# Planner returns JSON
        if output_key == "planner_output":

            planner = json.loads(result)

            state["planner_output"] = planner

            state["required_agents"] = planner.get(
                "required_agents",
                [],
            )

            state["execution_order"] = planner.get(
                "execution_order",
                [],
            )

        # All other agents return normal text
        else:

            state[output_key] = result

        # ── Step 4: Notify clients of successful completion ──────────────────
        _run_async(broadcast_agent_completed(agent_name))

    except Exception as exc:
        # ── Step 5: Notify clients of failure, then let LangGraph handle it ──
        _run_async(broadcast_agent_failed(agent_name, type(exc).__name__))
        raise

    return state
