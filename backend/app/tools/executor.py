"""
executor.py
-----------
Helper utility for executing tools with automatic metadata capture and real-time
WebSocket lifecycle broadcasting.

Enforces rules for Phase 1 (Tool Execution Metadata):
- Captures tool_name, agent_name, status, started_at, completed_at, execution_time_ms, input_summary, output_summary, error.
- Appends metadata record to state["tool_executions"].
- Broadcasts tool_started, tool_completed, and tool_failed events via WebSocket.
"""

import time
from datetime import datetime, timezone
from typing import Any, Callable
from app.orchestrator.agent_executor import _run_async
from app.websocket.events import (
    broadcast_tool_started,
    broadcast_tool_completed,
    broadcast_tool_failed,
)
from app.core.logger import logger


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _format_input_summary(arg: Any) -> str:
    try:
        if hasattr(arg, "model_dump"):
            data = arg.model_dump()
        elif hasattr(arg, "dict"):
            data = arg.dict()
        elif isinstance(arg, dict):
            data = arg
        else:
            return str(arg)[:150]
        summary_items = [f"{k}={v}" for k, v in data.items() if v is not None and v != "" and v != 0 and v != False]
        summary_str = ", ".join(summary_items) if summary_items else "Default arguments"
        return summary_str[:150] + ("..." if len(summary_str) > 150 else "")
    except Exception:
        return str(arg)[:150]


def _format_output_summary(tool_name: str, output: Any) -> str:
    try:
        if isinstance(output, dict):
            if tool_name == "SearchTool":
                results_len = len(output.get("results", []))
                return f"Retrieved {results_len} web results"
            elif tool_name == "BudgetTool":
                roi = output.get("roi_percentage")
                return f"ROI calculated: {roi}%" if roi is not None else "ROI calculated"
            elif tool_name == "CarbonTool":
                total_emissions = output.get("total_emissions")
                return f"Estimated annual emissions: {total_emissions} tCO2e" if total_emissions is not None else "Estimated annual emissions"
            elif tool_name == "WeatherTool":
                temp = output.get("temperature")
                return f"Retrieved current weather ({temp}°C)" if temp is not None else "Retrieved current weather"
            elif tool_name == "MapsTool":
                lat = output.get("latitude")
                lon = output.get("longitude")
                return f"Coordinates resolved ({lat}, {lon})" if lat is not None and lon is not None else "Coordinates resolved"
            elif tool_name == "PolicyTool":
                compliant = output.get("overall_compliant", True)
                return f"Compliance analysis completed (Compliant: {compliant})"
            else:
                return "Completed successfully"
        else:
            return str(output)[:100]
    except Exception:
        return "Completed successfully"


def execute_tool_with_metadata(
    state: dict,
    tool_name: str,
    agent_name: str,
    tool_fn: Callable,
    *args,
    **kwargs,
) -> Any:
    """
    Execute a tool function while capturing execution metadata and emitting real-time events.
    """
    _run_async(broadcast_tool_started(tool_name, agent_name))
    start_time = time.perf_counter()
    started_at = _now_iso()

    input_arg = args[0] if args else (kwargs if kwargs else {})
    input_summary = _format_input_summary(input_arg)

    try:
        output = tool_fn(*args, **kwargs)
        execution_time_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
        completed_at = _now_iso()
        output_summary = _format_output_summary(tool_name, output)

        record = {
            "tool_name": tool_name,
            "agent_name": agent_name,
            "status": "Completed",
            "started_at": started_at,
            "completed_at": completed_at,
            "execution_time_ms": execution_time_ms,
            "input_summary": input_summary,
            "output_summary": output_summary,
            "error": None,
        }

        if "tool_executions" not in state or not isinstance(state["tool_executions"], list):
            state["tool_executions"] = []
        state["tool_executions"].append(record)

        logger.info("[%s] %s completed in %.2fms", agent_name, tool_name, execution_time_ms)
        _run_async(broadcast_tool_completed(tool_name, agent_name, output_summary, execution_time_ms))
        return output

    except Exception as exc:
        execution_time_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
        completed_at = _now_iso()
        error_str = str(exc)
        output_summary = "Tool execution failed"

        record = {
            "tool_name": tool_name,
            "agent_name": agent_name,
            "status": "Failed",
            "started_at": started_at,
            "completed_at": completed_at,
            "execution_time_ms": execution_time_ms,
            "input_summary": input_summary,
            "output_summary": output_summary,
            "error": error_str,
        }

        if "tool_executions" not in state or not isinstance(state["tool_executions"], list):
            state["tool_executions"] = []
        state["tool_executions"].append(record)

        logger.error("[%s] %s failed in %.2fms: %s", agent_name, tool_name, execution_time_ms, error_str)
        _run_async(broadcast_tool_failed(tool_name, agent_name, error_str, execution_time_ms))
        raise exc
