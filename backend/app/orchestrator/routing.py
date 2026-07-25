"""
routing.py
----------
Conditional edge functions for the LangGraph pipeline.

Each function receives the current GraphState and returns the name of the
next node.  LangGraph matches the returned string against the edge map
registered in graph.py.

Design notes
------------
- ``execution_order`` always ends with ``"report"`` (added by
  ``resolve_dependencies``).
- ``_next_agent`` returns ``"report"`` as the terminal sentinel when no
  further agent is found.
"""


def _next_agent(state: dict, current_agent: str) -> str:
    """
    Return the next agent name after ``current_agent`` in ``execution_order``.
    """
    execution_order = state.get("execution_order", [])

    if current_agent not in execution_order:
        return "report"

    current_index = execution_order.index(current_agent)

    if current_index + 1 < len(execution_order):
        return execution_order[current_index + 1]

    return "report"


def route_after_planner(state: dict) -> str:
    execution_order = state.get("execution_order", [])

    if not execution_order:
        return "report"

    return execution_order[0]


def route_after_research(state: dict) -> str:
    return _next_agent(state, "research")


def route_after_sdg(state: dict) -> str:
    return _next_agent(state, "sdg")


def route_after_policy(state: dict) -> str:
    return _next_agent(state, "policy")


def route_after_environmental(state: dict) -> str:
    return _next_agent(state, "environmental")


def route_after_finance(state: dict) -> str:
    return _next_agent(state, "finance")


def route_after_risk(state: dict) -> str:
    return _next_agent(state, "risk")


def route_after_timeline(state: dict) -> str:
    return _next_agent(state, "timeline")
