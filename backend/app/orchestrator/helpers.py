def update_missing_information(state, agent_output):
    """
    Merge missing_information from an agent into the shared state.
    """

    shared = set(state.get("missing_information", []))

    current = set(
        agent_output.get("missing_information", [])
    )

    state["missing_information"] = list(shared | current)

def update_agent_status(state, agent_name, output):
    """
    Update the execution status of an agent.
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