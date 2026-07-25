"""
helpers.py
----------
Pure utility functions used by graph nodes.

The ``update_*`` functions mutate state in-place (the new pattern used by
nodes.py after the teammate's refactor).  The node functions call these
helpers so state management logic stays out of individual node functions.
"""

from typing import Dict, List, Any


# ─── Agent registry ───────────────────────────────────────────────────────────

ALL_AGENTS: List[str] = [
    "research",
    "sdg",
    "policy",
    "environmental",
    "finance",
    "risk",
    "timeline",
]


# ─── missing_information ─────────────────────────────────────────────────────

def update_missing_information(state: dict, agent_output: dict) -> None:
    """
    Merge missing_information from an agent into shared state.

    Items are objects: {"type": "...", "description": "..."}.
    Deduplicates on the ``description`` field.
    Mutates state in-place.
    """
    shared = state.setdefault("missing_information", [])

    existing_descriptions = {
        item.get("description")
        for item in shared
        if isinstance(item, dict)
    }

    for item in agent_output.get("missing_information", []):
        if not isinstance(item, dict):
            continue
        description = item.get("description")
        if description and description not in existing_descriptions:
            shared.append(item)
            existing_descriptions.add(description)


# ─── agent_status ─────────────────────────────────────────────────────────────

def update_agent_status(state: dict, agent_name: str, agent_output: dict) -> None:
    """
    Set agent_name's status in state["agent_status"] from the agent output.

    Valid statuses: completed | incomplete | failed | skipped
    Mutates state in-place.
    """
    status = agent_output.get("status", "failed")
    state.setdefault("agent_status", {})[agent_name] = status


# ─── errors ──────────────────────────────────────────────────────────────────

def update_error(state: dict, agent_name: str, agent_output: dict) -> None:
    """
    Record an error for agent_name if it reported ``status == "failed"``.
    Mutates state in-place.
    """
    if agent_output.get("status") == "failed":
        error_msg = agent_output.get("error", "Unknown error")
        state.setdefault("errors", {})[agent_name] = error_msg