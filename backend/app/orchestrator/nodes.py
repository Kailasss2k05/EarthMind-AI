from app.agents.planner import PlannerAgent
from app.agents.research import ResearchAgent
from app.agents.sdg import SDGAgent
from app.agents.policy import PolicyAgent
from app.agents.environmental import EnvironmentalAgent

planner = PlannerAgent()
research = ResearchAgent()
sdg = SDGAgent()
policy = PolicyAgent()
environment = EnvironmentalAgent()
"""
LangGraph node definitions for EarthMind AI.

Each node delegates execution to execute_agent(), which handles:
  - reading the query from state
  - broadcasting lifecycle events (started / completed / failed)
  - writing the result back to state
  - re-raising exceptions for LangGraph error handling

def planner_node(state):

    result = planner.run(state)

    state["planner_output"] = result

    query = state["query"].lower()

    if "budget" in query or "cost" in query or "finance" in query:
        state["next_step"] = "finance"

    elif "policy" in query or "government" in query:
        state["next_step"] = "policy"

    elif "environment" in query or "carbon" in query or "climate" in query:
        state["next_step"] = "environmental"

    else:
        state["next_step"] = "research"

    return state

def research_node(state):
    state["research_output"] = research.run(state)
    return state


def sdg_node(state):
    state["sdg_output"] = sdg.run(state)
    return state


def policy_node(state):
    state["policy_output"] = policy.run(state)
    return state


def environmental_node(state):
    state["environmental_output"] = environment.run(state)
    return state

from app.agents.finance import FinanceAgent
from app.agents.risk import RiskAgent
from app.agents.timeline import TimelineAgent
from app.agents.report import ReportAgent

finance = FinanceAgent()
risk = RiskAgent()
timeline = TimelineAgent()
report = ReportAgent()


def finance_node(state):
    state["finance_output"] = finance.run(state)
    return state


def risk_node(state):
    state["risk_output"] = risk.run(state)
    return state


def timeline_node(state):
    state["timeline_output"] = timeline.run(state)
    return state


def report_node(state):
    state["report_output"] = report.run(state)
    return state
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
