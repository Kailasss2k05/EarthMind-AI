"""
LangGraph node definitions for EarthMind AI.

Each node delegates execution to execute_agent(), which handles:
  - reading the query from state
  - broadcasting lifecycle events (started / completed / failed)
  - writing the result back to state
  - re-raising exceptions for LangGraph error handling

To add a new agent node:
    1. Import its agent function.
    2. Add a one-liner node using execute_agent().
    3. Register the node in graph.py.

Example:
    from app.agents.research import research_agent

    def research_node(state):
        return execute_agent(
            agent_name="Research",
            agent_function=research_agent,
            state=state,
            output_key="research_output",
        )
"""

from app.orchestrator.agent_executor import execute_agent
from app.agents.planner import planner_agent


def planner_node(state):
    """Planner Node — breaks the user query into a structured implementation plan."""
    return execute_agent(
        agent_name="Planner",
        agent_function=planner_agent,
        state=state,
        output_key="planner_output",
    )