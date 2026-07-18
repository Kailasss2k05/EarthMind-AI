def _next_agent(state, current_agent):
    execution_order = state.get("execution_order", [])

    if current_agent not in execution_order:
        return "report"

    current_index = execution_order.index(current_agent)

    if current_index + 1 < len(execution_order):
        return execution_order[current_index + 1]

    return "report"


def route_after_planner(state):
    execution_order = state.get("execution_order", [])

    if not execution_order:
        return "report"

    return execution_order[0]


def route_after_research(state):
    return _next_agent(state, "research")


def route_after_sdg(state):
    return _next_agent(state, "sdg")


def route_after_policy(state):
    return _next_agent(state, "policy")


def route_after_environmental(state):
    return _next_agent(state, "environmental")


def route_after_finance(state):
    return _next_agent(state, "finance")


def route_after_risk(state):
    return _next_agent(state, "risk")


def route_after_timeline(state):
    return _next_agent(state, "timeline")