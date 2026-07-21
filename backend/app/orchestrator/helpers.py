"""
helpers.py
----------
Pure utility functions used by graph nodes.

Design contract
---------------
Each function ACCEPTS the relevant sub-dict and RETURNS a new value.
Nodes are responsible for assembling the returned patch dict.
Nothing here mutates state in-place, keeping the LangGraph
immutability model intact.
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


# ─── missing_information ──────────────────────────────────────────────────────

def merge_missing_information(
    current: List[str],
    agent_output: dict,
) -> List[str]:
    """
    Return a deduplicated union of the current shared missing-information list
    and whatever the agent reported as missing.

    Parameters
    ----------
    current      : The existing ``state["missing_information"]`` list.
    agent_output : The dict returned by an agent's ``run()`` method.

    Returns
    -------
    A new list (no mutation of the input).
    """
    existing = set(current or [])
    new = set(agent_output.get("missing_information", []) or [])
    return sorted(existing | new)


# ─── agent_status ─────────────────────────────────────────────────────────────

def updated_agent_status(
    current: Dict[str, str],
    agent_name: str,
    agent_output: dict,
) -> Dict[str, str]:
    """
    Return a new agent_status dict with ``agent_name`` set to the status
    reported by the agent.

    Valid statuses: success | incomplete | failed | skipped

    Parameters
    ----------
    current      : The existing ``state["agent_status"]`` dict.
    agent_name   : Canonical agent key (e.g. ``"research"``).
    agent_output : The dict returned by an agent's ``run()`` method.

    Returns
    -------
    A new dict (no mutation of the input).
    """
    status = agent_output.get("status", "failed")
    return {**current, agent_name: status}


# ─── errors ───────────────────────────────────────────────────────────────────

def updated_errors(
    current: Dict[str, str],
    agent_name: str,
    agent_output: dict,
) -> Dict[str, str]:
    """
    Return a new errors dict that includes ``agent_name``'s error if the
    agent reported a ``"failed"`` status.

    Parameters
    ----------
    current      : The existing ``state["errors"]`` dict.
    agent_name   : Canonical agent key.
    agent_output : The dict returned by an agent's ``run()`` method.

    Returns
    -------
    A new dict (no mutation of the input).
    """
    if agent_output.get("status") == "failed":
        error_msg = agent_output.get("error", "Unknown error")
        return {**current, agent_name: error_msg}
    return dict(current)