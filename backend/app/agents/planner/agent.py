from app.core.base_agent import BaseAgent

from app.prompts.planner_prompt import PLANNER_PROMPT

from app.prompts.planner_prompt import PLANNER_PROMPT




class PlannerAgent(BaseAgent):

    def build_prompt(self, state):

        prompt = PLANNER_PROMPT.format(
            query=state["query"]
        )

        response = self.llm.invoke(prompt)

        state["planner_output"] = response.content

        return state

        