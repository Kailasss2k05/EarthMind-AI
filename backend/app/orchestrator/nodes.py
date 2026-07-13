from app.agents.planner import planner_agent


def planner_node(state):
    """
    Planner Node
    """

    query = state["query"]

    planner_result = planner_agent(query)

    state["planner_output"] = planner_result

    return state