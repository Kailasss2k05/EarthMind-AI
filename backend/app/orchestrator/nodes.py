from app.agents.planner import PlannerAgent

planner = PlannerAgent()


def planner_node(state):

    result = planner.run(state)

    state["planner_output"] = result

    return state