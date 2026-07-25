"""
Event broadcaster for EarthMind AI agent execution events.

Uses the shared ConnectionManager singleton to broadcast structured JSON events
to all connected WebSocket clients.

Each event envelope:
    {
        "type":      "agent_started" | "agent_completed" | "agent_failed",
        "agent":     "<agent name>",
        "timestamp": "<ISO-8601 UTC>",
        # only present on agent_failed:
        "reason":    "<error description>"
    }

Usage (inside any async context):
    from app.websocket.events import broadcast_agent_started
    await broadcast_agent_started("Planner")
"""

from datetime import datetime, timezone
from app.websocket.manager import manager
from app.core.logger import logger


def _now() -> str:
    """Return the current UTC time as an ISO-8601 string."""
    return datetime.now(timezone.utc).isoformat()


async def broadcast_agent_started(agent_name: str) -> None:
    """
    Broadcast an 'agent_started' event to all connected WebSocket clients.
    Called immediately before an agent begins its work.
    """
    event = {
        "type": "agent_started",
        "agent": agent_name,
        "timestamp": _now(),
    }
    logger.info("[Event] agent_started -> %s", agent_name)
    await manager.broadcast(event)


async def broadcast_agent_completed(agent_name: str) -> None:
    """
    Broadcast an 'agent_completed' event to all connected WebSocket clients.
    Called when an agent finishes successfully.
    """
    event = {
        "type": "agent_completed",
        "agent": agent_name,
        "timestamp": _now(),
    }
    logger.info("[Event] agent_completed -> %s", agent_name)
    await manager.broadcast(event)


async def broadcast_agent_failed(agent_name: str, reason: str) -> None:
    """
    Broadcast an 'agent_failed' event to all connected WebSocket clients.
    Called when an agent raises an unhandled exception.
    """
    event = {
        "type": "agent_failed",
        "agent": agent_name,
        "reason": reason,
        "timestamp": _now(),
    }
    logger.error("[Event] agent_failed -> %s | reason: %s", agent_name, reason)
    await manager.broadcast(event)


async def broadcast_tool_started(tool_name: str, agent_name: str) -> None:
    """
    Broadcast a 'tool_started' event when an agent begins executing a tool.
    """
    event = {
        "type": "tool_started",
        "tool_name": tool_name,
        "agent_name": agent_name,
        "status": "Running",
        "execution_time_ms": 0.0,
        "summary": f"{tool_name} Running",
        "timestamp": _now(),
    }
    logger.info("[Event] tool_started -> %s (%s)", tool_name, agent_name)
    await manager.broadcast(event)


async def broadcast_tool_completed(tool_name: str, agent_name: str, summary: str, execution_time_ms: float) -> None:
    """
    Broadcast a 'tool_completed' event when a tool finishes successfully.
    """
    event = {
        "type": "tool_completed",
        "tool_name": tool_name,
        "agent_name": agent_name,
        "status": "Completed",
        "execution_time_ms": execution_time_ms,
        "summary": summary,
        "timestamp": _now(),
    }
    logger.info("[Event] tool_completed -> %s (%s) in %.2fms", tool_name, agent_name, execution_time_ms)
    await manager.broadcast(event)


async def broadcast_tool_failed(tool_name: str, agent_name: str, error: str, execution_time_ms: float) -> None:
    """
    Broadcast a 'tool_failed' event when a tool raises an exception.
    """
    event = {
        "type": "tool_failed",
        "tool_name": tool_name,
        "agent_name": agent_name,
        "status": "Failed",
        "execution_time_ms": execution_time_ms,
        "summary": "Tool execution failed",
        "error": error,
        "timestamp": _now(),
    }
    logger.error("[Event] tool_failed -> %s (%s) | error: %s", tool_name, agent_name, error)
    await manager.broadcast(event)

