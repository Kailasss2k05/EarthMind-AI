from app.orchestrator.state import GraphState


def route_after_planner(state: GraphState):

    agents = state["required_agents"]

    if "research" in agents:
        return "research"

    if "sdg" in agents:
        return "sdg"

    if "policy" in agents:
        return "policy"

    if "environmental" in agents:
        return "environmental"

    if "finance" in agents:
        return "finance"

    if "risk" in agents:
        return "risk"

    if "timeline" in agents:
        return "timeline"

    return "report"

def route_after_research(state: GraphState):

    agents = state["required_agents"]

    if "sdg" in agents:
        return "sdg"

    if "policy" in agents:
        return "policy"

    if "environmental" in agents:
        return "environmental"

    if "finance" in agents:
        return "finance"

    if "risk" in agents:
        return "risk"

    if "timeline" in agents:
        return "timeline"

    return "report"

def route_after_sdg(state: GraphState):

    agents = state["required_agents"]

    if "policy" in agents:
        return "policy"

    if "environmental" in agents:
        return "environmental"

    if "finance" in agents:
        return "finance"

    if "risk" in agents:
        return "risk"

    if "timeline" in agents:
        return "timeline"

    return "report"

def route_after_policy(state: GraphState):

    agents = state["required_agents"]

    if "environmental" in agents:
        return "environmental"

    if "finance" in agents:
        return "finance"

    if "risk" in agents:
        return "risk"

    if "timeline" in agents:
        return "timeline"

    return "report"

def route_after_environmental(state: GraphState):

    agents = state["required_agents"]

    if "finance" in agents:
        return "finance"

    if "risk" in agents:
        return "risk"

    if "timeline" in agents:
        return "timeline"

    return "report"

def route_after_finance(state: GraphState):

    agents = state["required_agents"]

    if "risk" in agents:
        return "risk"

    if "timeline" in agents:
        return "timeline"

    return "report"

def route_after_risk(state: GraphState):

    agents = state["required_agents"]

    if "timeline" in agents:
        return "timeline"

    return "report"

def route_after_timeline(state: GraphState):
    return "report"