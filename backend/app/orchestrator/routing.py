"""
routing.py
----------
Conditional edge functions for the LangGraph pipeline.

Each function receives the current GraphState and returns the name of the
next node.  LangGraph matches the returned string against the edge map
registered in graph.py.

Design notes
------------
• ``execution_order`` always ends with ``"report"`` (added by
  ``resolve_dependencies``).  All routing functions strip ``"report"``
  before index lookups to avoid accidentally using it as a mid-chain node.
• If the current agent is not found in ``execution_order`` (e.g. it was
  added by the planner but skipped by a route short-circuit), fall through
  to ``"report"``.
"""


def _next_agent(state: dict, current_agent: str) -> str:
    """
    Return the next agent name after ``current_agent`` in ``execution_order``.

    ``"report"`` is always the terminal sentinel — it is excluded from the
    search window so we never accidentally route back to a mid-chain agent
    whose index happens to equal the report sentinel position.
    """
    execution_order = state.get("execution_order", [])
    # Exclude "report" from position lookups; it is always the terminal node.
    chain = [a for a in execution_order if a != "report"]

    if current_agent not in chain:
        return "report"

    idx = chain.index(current_agent)
    if idx + 1 < len(chain):
        return chain[idx + 1]

    return "report"


def route_after_planner(state: dict) -> str:
    execution_order = state.get("execution_order", [])
    chain = [a for a in execution_order if a != "report"]

    if not chain:
        return "report"

    return chain[0]


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