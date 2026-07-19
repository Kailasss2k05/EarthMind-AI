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


from app.services.llm import get_llm
from app.orchestrator.helpers import update_agent_status, update_error, update_missing_information

llm = get_llm()

planner = PlannerAgent(llm)
research = ResearchAgent(llm)
sdg = SDGAgent(llm)
policy = PolicyAgent(llm)
environmental = EnvironmentalAgent(llm)
finance = FinanceAgent(llm)
risk = RiskAgent(llm)
timeline = TimelineAgent(llm)
report = ReportAgent(llm)


def planner_node(state):
    """
    Planner generates a JSON execution plan.
    """

    result = planner.run(state)

    planner_json = result

    required = planner_json.get("required_agents", [])

    state["planner_output"] = planner_json

    state["required_agents"] = required

    state["execution_order"] = resolve_dependencies(required)
    from app.orchestrator.helpers import ALL_AGENTS

    for agent in ALL_AGENTS:
        if agent not in state["execution_order"]:
            state["agent_status"][agent] = "skipped"

    return state


def research_node(state):
    state["outputs"]["research"] = research.run(state)
    update_missing_information(state, state["outputs"]["research"])
    update_agent_status(
        state,
        "research",
        state["outputs"]["research"]
    )
    update_error(
        state,
        "research",
        state["outputs"]["research"]
    )

    return state


def sdg_node(state):
    state["outputs"]["sdg"] = sdg.run(state)
    update_missing_information(state, state["outputs"]["sdg"])
    update_agent_status(
        state,
        "sdg",
        state["outputs"]["sdg"]
    )
    update_error(
        state,
        "sdg",
        state["outputs"]["sdg"]
    )
    return state


def policy_node(state):
    state["outputs"]["policy"] = policy.run(state)
    update_missing_information(state, state["outputs"]["policy"])
    update_agent_status(
        state,
        "policy",
        state["outputs"]["policy"]
    )
    update_error(
        state,
        "policy",
        state["outputs"]["policy"]
    )
    return state


def environmental_node(state):
    state["outputs"]["environmental"] = environmental.run(state)
    update_missing_information(state, state["outputs"]["environmental"])
    update_agent_status(
        state,
        "environmental",
        state["outputs"]["environmental"]
    )
    update_error(
        state,
        "environmental",
        state["outputs"]["environmental"]
    )
    return state


def finance_node(state):
    state["outputs"]["finance"] = finance.run(state)
    update_missing_information(state, state["outputs"]["finance"])
    update_agent_status(
        state,
        "finance",
        state["outputs"]["finance"]
    )
    update_error(
        state,
        "finance",
        state["outputs"]["finance"]
    )
    return state


def risk_node(state):
    state["outputs"]["risk"] = risk.run(state)
    update_missing_information(state, state["outputs"]["risk"])
    update_agent_status(
        state,
        "risk",
        state["outputs"]["risk"]
    )
    update_error(
        state,
        "risk",
        state["outputs"]["risk"]
    )
    return state


def timeline_node(state):
    state["outputs"]["timeline"] = timeline.run(state)
    update_missing_information(state, state["outputs"]["timeline"])
    update_agent_status(
        state,
        "timeline",
        state["outputs"]["timeline"]
    )
    update_error(
        state,
        "timeline",
        state["outputs"]["timeline"]
    )
    return state


def report_node(state):
    state["outputs"]["report"] = report.run(state)
    return state