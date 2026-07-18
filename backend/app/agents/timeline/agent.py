from app.core.base_agent import BaseAgent
from app.prompts.timeline_prompt import TIMELINE_PROMPT


class TimelineAgent(BaseAgent):

    def build_prompt(self, state):

        return TIMELINE_PROMPT.format(
            query=state["query"],
            finance_output=state.get("finance_output", ""),
            risk_output=state.get("risk_output", "")
        )