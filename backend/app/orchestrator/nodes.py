<<<<<<< HEAD
"""
LangGraph node definitions for EarthMind AI.
=======
import json

from app.agents.planner import PlannerAgent
from app.agents.research import ResearchAgent
from app.agents.sdg import SDGAgent
from app.agents.policy import PolicyAgent
from app.agents.environmental import EnvironmentalAgent
from app.agents.finance import FinanceAgent
from app.agents.risk import RiskAgent
from app.agents.timeline import TimelineAgent
from app.agents.report import ReportAgent
from app.orchestrator.dependencies import resolve_dependencies


planner = PlannerAgent()
research = ResearchAgent()
sdg = SDGAgent()
policy = PolicyAgent()
environmental = EnvironmentalAgent()
finance = FinanceAgent()
risk = RiskAgent()
timeline = TimelineAgent()
report = ReportAgent()
>>>>>>> 944fcf0 (improved planner logic)


<<<<<<< HEAD
To add a new agent node:
    1. Import its agent class.
    2. Instantiate it as a module-level singleton below.
    3. Add a node function that wraps the agent in execute_agent().
    4. Register the node in graph.py.
"""

from app.agents.planner import PlannerAgent
from app.agents.research import ResearchAgent
from app.agents.sdg import SDGAgent
from app.agents.policy import PolicyAgent
from app.agents.environmental import EnvironmentalAgent
from app.agents.finance import FinanceAgent
from app.agents.risk import RiskAgent
from app.agents.timeline import TimelineAgent
from app.agents.report import ReportAgent

from app.orchestrator.agent_executor import execute_agent

# ---------------------------------------------------------------------------
# Module-level singletons — instantiated once at startup, shared across all
# LangGraph invocations. This avoids re-creating LLM clients per request.
# ---------------------------------------------------------------------------
planner = PlannerAgent()
research = ResearchAgent()
sdg = SDGAgent()
policy = PolicyAgent()
environment = EnvironmentalAgent()
finance = FinanceAgent()
risk = RiskAgent()
timeline = TimelineAgent()
report = ReportAgent()

=======
def planner_node(state):
    """
    Planner generates a JSON execution plan.
    """

    result = planner.run(state)

    try:
        planner_json = json.loads(result)
        print("Planner Output:")
        print(planner_json)
    except json.JSONDecodeError:
        raise ValueError(
            "Planner Agent did not return valid JSON."
        )

    state["planner_output"] = planner_json

    state["required_agents"] = planner_json.get(
        "required_agents",
        [],
    )

    required = planner_json.get("required_agents", [])

    state["required_agents"] = required
    state["execution_order"] = resolve_dependencies(required)

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
    state["environmental_output"] = environmental.run(state)
    return state

>>>>>>> 944fcf0 (improved planner logic)

# ---------------------------------------------------------------------------
# Node functions
# Each node wraps its agent with execute_agent() to get:
#   - automatic WebSocket lifecycle broadcasting
#   - consistent error handling and re-raising
#
# The lambda adapter bridges execute_agent's Callable[[str], str] contract
# with BaseAgent.run(state: dict) -> str by reconstructing a minimal state
# dict containing the query string.
# ---------------------------------------------------------------------------

<<<<<<< HEAD
def planner_node(state: dict) -> dict:
    """Planner Node — breaks the user query into a structured implementation plan.
    Sets state['next_step'] to route to the correct specialist agent branch.
    """
    state = execute_agent(
        agent_name="Planner",
        agent_function=lambda q: planner.run({**state, "query": q}),
        state=state,
        output_key="planner_output",
    )

    # Keyword-based routing: pick the first specialist that matches the query.
    query = state["query"].lower()
    if "budget" in query or "cost" in query or "finance" in query:
        state["next_step"] = "finance"
    elif "policy" in query or "government" in query or "regulation" in query:
        state["next_step"] = "policy"
    elif "environment" in query or "carbon" in query or "climate" in query:
        state["next_step"] = "environmental"
    else:
        state["next_step"] = "research"

    return state


def research_node(state: dict) -> dict:
    """Research Node — gathers supporting evidence and data."""
    return execute_agent(
        agent_name="Research",
        agent_function=lambda q: research.run({**state, "query": q}),
        state=state,
        output_key="research_output",
    )


def sdg_node(state: dict) -> dict:
    """SDG Node — maps the query to UN Sustainable Development Goals."""
    return execute_agent(
        agent_name="SDG",
        agent_function=lambda q: sdg.run({**state, "query": q}),
        state=state,
        output_key="sdg_output",
    )


def policy_node(state: dict) -> dict:
    """Policy Node — identifies relevant policy frameworks and regulations."""
    return execute_agent(
        agent_name="Policy",
        agent_function=lambda q: policy.run({**state, "query": q}),
        state=state,
        output_key="policy_output",
    )


def environmental_node(state: dict) -> dict:
    """Environmental Node — assesses environmental impact and metrics."""
    return execute_agent(
        agent_name="Environmental",
        agent_function=lambda q: environment.run({**state, "query": q}),
        state=state,
        output_key="environmental_output",
    )


def finance_node(state: dict) -> dict:
    """Finance Node — estimates costs, funding sources, and ROI."""
    return execute_agent(
        agent_name="Finance",
        agent_function=lambda q: finance.run({**state, "query": q}),
        state=state,
        output_key="finance_output",
    )


def risk_node(state: dict) -> dict:
    """Risk Node — identifies risks and mitigation strategies."""
    return execute_agent(
        agent_name="Risk",
        agent_function=lambda q: risk.run({**state, "query": q}),
        state=state,
        output_key="risk_output",
    )


def timeline_node(state: dict) -> dict:
    """Timeline Node — creates a phased implementation timeline."""
    return execute_agent(
        agent_name="Timeline",
        agent_function=lambda q: timeline.run({**state, "query": q}),
        state=state,
        output_key="timeline_output",
    )


def report_node(state: dict) -> dict:
    """Report Node — synthesizes all agent outputs into a final report."""
    return execute_agent(
        agent_name="Report",
        agent_function=lambda q: report.run({**state, "query": q}),
        state=state,
        output_key="report_output",
    )
=======

def risk_node(state):
    state["risk_output"] = risk.run(state)
    return state


def timeline_node(state):
    state["timeline_output"] = timeline.run(state)
    return state


def report_node(state):
    state["report_output"] = report.run(state)
    return state
>>>>>>> 944fcf0 (improved planner logic)
