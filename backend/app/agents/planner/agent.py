from app.core.base_agent import BaseAgent

from app.prompts.planner_prompt import PLANNER_PROMPT


class PlannerAgent(BaseAgent):

    def build_prompt(self, state):

        return PLANNER_PROMPT.format(

            query=state["query"]

        )