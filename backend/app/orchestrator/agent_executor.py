"""
agent_executor.py
-----------------
Provides ``_run_async`` — the thread-safe bridge between synchronous
LangGraph node functions and the async WebSocket event loop.

Why this exists
---------------
LangGraph node functions are synchronous.  WebSocket broadcasts are async.
``asyncio.to_thread`` runs the entire graph in a worker thread, so node
functions cannot ``await`` coroutines directly.  ``_run_async`` submits a
coroutine to the *main* event loop (captured during lifespan startup) from
within that worker thread, ensuring broadcasts never block the graph and
never deadlock.

Usage (inside any synchronous node function)
--------------------------------------------
    from app.orchestrator.agent_executor import _run_async
    from app.websocket.events import broadcast_agent_started

    _run_async(broadcast_agent_started("Research"))
"""

import asyncio
from concurrent.futures import Future
from typing import Coroutine


def _run_async(coro: Coroutine) -> None:
    """
    Schedule ``coro`` on the main event loop from any thread.

    Strategy
    --------
    1. If ``manager.loop`` is set (normal production path via lifespan),
       submit the coroutine thread-safely and return immediately —
       the broadcast is fire-and-forget.
    2. Fallback for CLI / test environments: try the running loop on the
       current thread; if none exists, run a new loop synchronously.
    """
    from app.websocket.manager import manager
    from app.core.logger import logger

    def _done_callback(fut: Future) -> None:
        try:
            fut.result()
        except Exception as exc:
            logger.error("WebSocket broadcast failed: %s", exc)

    if manager.loop and manager.loop.is_running():
        fut = asyncio.run_coroutine_threadsafe(coro, manager.loop)
        fut.add_done_callback(_done_callback)
        return

    # Fallback: no managed loop available
    try:
        loop = asyncio.get_running_loop()
        fut = asyncio.run_coroutine_threadsafe(coro, loop)
        fut.add_done_callback(_done_callback)
    except RuntimeError:
        # No event loop on this thread at all — run synchronously
        asyncio.run(coro)
