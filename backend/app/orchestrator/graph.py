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
# Create graph builder
builder = StateGraph(GraphState)

# Register nodes
builder.add_node("planner", planner_node)
builder.add_node("research", research_node)
builder.add_node("sdg", sdg_node)
builder.add_node("policy", policy_node)
builder.add_node("environmental", environmental_node)
builder.add_node("finance", finance_node)
builder.add_node("risk", risk_node)
builder.add_node("timeline", timeline_node)
builder.add_node("report", report_node)

builder.add_edge(START, "planner")
builder.add_edge("planner", "research")
builder.add_edge("research", "sdg")
builder.add_edge("sdg", "policy")
builder.add_edge("policy", "environmental")
builder.add_edge("environmental", "finance")
builder.add_edge("finance", "risk")
builder.add_edge("risk", "timeline")
builder.add_edge("timeline", "report")
builder.add_edge("report", END)

# Compile graph
graph = builder.compile()