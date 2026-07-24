from langgraph.graph import StateGraph, START, END

from app.orchestrator.state import GraphState

from app.orchestrator.nodes import (
    planner_node,
    research_node,
    sdg_node,
    policy_node,
    environmental_node,
    finance_node,
    risk_node,
    timeline_node,
    report_node,
)

from app.orchestrator.routing import (
    route_after_planner,
    route_after_research,
    route_after_sdg,
    route_after_policy,
    route_after_environmental,
    route_after_finance,
    route_after_risk,
    route_after_timeline,
)

builder = StateGraph(GraphState)

# ----------------------------
# Register Nodes
# ----------------------------

builder.add_node("planner", planner_node)
builder.add_node("research", research_node)
builder.add_node("sdg", sdg_node)
builder.add_node("policy", policy_node)
builder.add_node("environmental", environmental_node)
builder.add_node("finance", finance_node)
builder.add_node("risk", risk_node)
builder.add_node("timeline", timeline_node)
builder.add_node("report", report_node)

# ----------------------------
# Start
# ----------------------------

builder.add_edge(START, "planner")

# ----------------------------
# Planner
# ----------------------------

builder.add_conditional_edges(
    "planner",
    route_after_planner,
    {
        "research": "research",
        "sdg": "sdg",
        "policy": "policy",
        "environmental": "environmental",
        "finance": "finance",
        "risk": "risk",
        "timeline": "timeline",
        "report": "report",
    },
)

# ----------------------------
# Research
# ----------------------------

builder.add_conditional_edges(
    "research",
    route_after_research,
    {
        "sdg": "sdg",
        "policy": "policy",
        "environmental": "environmental",
        "finance": "finance",
        "risk": "risk",
        "timeline": "timeline",
        "report": "report",
    },
)

# ----------------------------
# SDG
# ----------------------------

builder.add_conditional_edges(
    "sdg",
    route_after_sdg,
    {
        "policy": "policy",
        "environmental": "environmental",
        "finance": "finance",
        "risk": "risk",
        "timeline": "timeline",
        "report": "report",
    },
)

# ----------------------------
# Policy
# ----------------------------

builder.add_conditional_edges(
    "policy",
    route_after_policy,
    {
        "environmental": "environmental",
        "finance": "finance",
        "risk": "risk",
        "timeline": "timeline",
        "report": "report",
    },
)

# ----------------------------
# Environmental
# ----------------------------

builder.add_conditional_edges(
    "environmental",
    route_after_environmental,
    {
        "finance": "finance",
        "risk": "risk",
        "timeline": "timeline",
        "report": "report",
    },
)

# ----------------------------
# Finance
# ----------------------------

builder.add_conditional_edges(
    "finance",
    route_after_finance,
    {
        "risk": "risk",
        "timeline": "timeline",
        "report": "report",
    },
)

# ----------------------------
# Risk
# ----------------------------

builder.add_conditional_edges(
    "risk",
    route_after_risk,
    {
        "timeline": "timeline",
        "report": "report",
    },
)

# ----------------------------
# Timeline
# ----------------------------

builder.add_conditional_edges(
    "timeline",
    route_after_timeline,
    {
        "report": "report",
    },
)

# ----------------------------
# End
# ----------------------------

builder.add_edge("report", END)

graph = builder.compile()from app.orchestrator.routing import (
    route_after_planner,
    route_after_research,
    route_after_sdg,
    route_after_policy,
    route_after_environmental,
    route_after_finance,
    route_after_risk,
    route_after_timeline,
)

_graph = None


def get_graph():
    """Return the compiled LangGraph graph, building it once on first call."""
    global _graph
    if _graph is not None:
        return _graph

    builder = StateGraph(GraphState)

    # ── Nodes ─────────────────────────────────────────────────────────────────
    builder.add_node("planner",       planner_node)
    builder.add_node("research",      research_node)
    builder.add_node("sdg",           sdg_node)
    builder.add_node("policy",        policy_node)
    builder.add_node("environmental", environmental_node)
    builder.add_node("finance",       finance_node)
    builder.add_node("risk",          risk_node)
    builder.add_node("timeline",      timeline_node)
    builder.add_node("report",        report_node)

    # ── Edges ─────────────────────────────────────────────────────────────────
    builder.add_edge(START, "planner")

    builder.add_conditional_edges(
        "planner",
        route_after_planner,
        {
            "research":      "research",
            "sdg":           "sdg",
            "policy":        "policy",
            "environmental": "environmental",
            "finance":       "finance",
            "risk":          "risk",
            "timeline":      "timeline",
            "report":        "report",
        },
    )

    builder.add_conditional_edges(
        "research",
        route_after_research,
        {
            "sdg":           "sdg",
            "policy":        "policy",
            "environmental": "environmental",
            "finance":       "finance",
            "risk":          "risk",
            "timeline":      "timeline",
            "report":        "report",
        },
    )

    builder.add_conditional_edges(
        "sdg",
        route_after_sdg,
        {
            "policy":        "policy",
            "environmental": "environmental",
            "finance":       "finance",
            "risk":          "risk",
            "timeline":      "timeline",
            "report":        "report",
        },
    )

    builder.add_conditional_edges(
        "policy",
        route_after_policy,
        {
            "environmental": "environmental",
            "finance":       "finance",
            "risk":          "risk",
            "timeline":      "timeline",
            "report":        "report",
        },
    )

    builder.add_conditional_edges(
        "environmental",
        route_after_environmental,
        {
            "finance":  "finance",
            "risk":     "risk",
            "timeline": "timeline",
            "report":   "report",
        },
    )

    builder.add_conditional_edges(
        "finance",
        route_after_finance,
        {
            "risk":     "risk",
            "timeline": "timeline",
            "report":   "report",
        },
    )

    builder.add_conditional_edges(
        "risk",
        route_after_risk,
        {
            "timeline": "timeline",
            "report":   "report",
        },
    )

    builder.add_conditional_edges(
        "timeline",
        route_after_timeline,
        {
            "report": "report",
        },
    )

    builder.add_edge("report", END)

    _graph = builder.compile()
    return _graph


# Graph is compiled lazily on get_graph() call. All modules should import get_graph.
