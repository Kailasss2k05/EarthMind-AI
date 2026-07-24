def update_missing_information(state, agent_output):
    """
    Merge missing_information from an agent into the shared state.
    Removes duplicates based on the description field.
    """

    shared = state.setdefault("missing_information", [])

    # Track descriptions already present
    existing_descriptions = {
        item.get("description")
        for item in shared
        if isinstance(item, dict)
    }

    for item in agent_output.get("missing_information", []):

        # Ignore malformed entries
        if not isinstance(item, dict):
            continue

        description = item.get("description")

        if description and description not in existing_descriptions:
            shared.append(item)
            existing_descriptions.add(description)


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