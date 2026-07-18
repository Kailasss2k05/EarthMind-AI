from app.core.base_agent import BaseAgent
from app.prompts.timeline_prompt import TIMELINE_PROMPT


class TimelineAgent(BaseAgent):

    def build_prompt(self, state):

        prompt = TIMELINE_PROMPT.format(
            planner_output=state["planner_output"],
            finance_output=state["finance_output"],
            risk_output=state["risk_output"]
        )

        response = self.llm.invoke(prompt)

        state["timeline_output"] = response.content

        return state