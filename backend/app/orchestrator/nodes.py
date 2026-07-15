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