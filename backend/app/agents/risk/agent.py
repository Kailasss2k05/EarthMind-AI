from app.core.base_agent import BaseAgent
from app.prompts.risk_prompt import RISK_PROMPT


class RiskAgent(BaseAgent):

    def build_prompt(self, state):

        return RISK_PROMPT.format(
            research_output=state.get("research_output", ""),
            finance_output=state.get("finance_output", ""),
            environmental_output=state.get("environmental_output", "")
        )