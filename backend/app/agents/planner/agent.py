from app.core.base_agent import BaseAgent

from app.prompts.planner_prompt import PLANNER_PROMPT

from app.prompts.planner_prompt import PLANNER_PROMPT


import json


class PlannerAgent(BaseAgent):

    def build_prompt(self, state):

        prompt = PLANNER_PROMPT.format(
            query=state["query"]
        )

        response = self.llm.invoke(prompt)

        planner = json.loads(response.content)

        state["planner_output"] = planner

        state["required_agents"] = planner["required_agents"]

        return state

        