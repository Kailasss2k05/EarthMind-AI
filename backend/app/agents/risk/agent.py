from app.core.base_agent import BaseAgent
from app.prompts.risk_prompt import RISK_PROMPT


class RiskAgent(BaseAgent):

    def build_prompt(self, state):

        return RISK_PROMPT.format(
            query=state["query"],
            planner=state["planner_output"],
            finance=state["finance_output"],
            environment=state["environmental_output"],
        )