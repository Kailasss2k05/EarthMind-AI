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

def update_agent_status(state, agent_name, output):
    """
    Update the execution status of an agent.
    Valid statuses:
    - success
    - incomplete
    - failed
    - skipped
    """

    status = output.get("status", "failed")

    state.setdefault("agent_status", {})[agent_name] = status
    
ALL_AGENTS = [
    "research",
    "sdg",
    "policy",
    "environmental",
    "finance",
    "risk",
    "timeline",
]
def update_error(state, agent_name, output):
    """
    Store agent errors in the shared state.
    """

    if output.get("status") == "failed":

        state.setdefault("errors", {})[agent_name] = output.get(
            "error",
            "Unknown error"
        )