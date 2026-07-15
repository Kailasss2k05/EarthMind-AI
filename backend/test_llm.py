from app.agents.planner import PlannerAgent

planner = PlannerAgent()

state = {

    "query":

    "Install solar panels in a college."

}

response = planner.run(state)

print(response)