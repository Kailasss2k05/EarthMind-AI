from langgraph.graph import StateGraph
from langgraph.graph import START
from langgraph.graph import END

from app.orchestrator.state import GraphState
from app.orchestrator.nodes import planner_node


builder = StateGraph(GraphState)

builder.add_node(
    "planner",
    planner_node
)

builder.add_edge(
    START,
    "planner"
)

builder.add_edge(
    "planner",
    END
)

graph = builder.compile()