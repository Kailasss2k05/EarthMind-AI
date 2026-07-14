from langgraph.graph import StateGraph, START, END

from app.orchestrator.state import GraphState
from app.orchestrator.nodes import planner_node, research_node

# Create graph builder
builder = StateGraph(GraphState)

# Register nodes
builder.add_node("planner", planner_node)
builder.add_node("research", research_node)

# Connect nodes
builder.add_edge(START, "planner")
builder.add_edge("planner", "research")
builder.add_edge("research", END)

# Compile graph
graph = builder.compile()