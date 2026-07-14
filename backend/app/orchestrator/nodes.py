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
    state["planner_output"] = planner.run(state)
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