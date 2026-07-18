from app.core.base_agent import BaseAgent
from app.prompts.finance_prompt import FINANCE_PROMPT


class FinanceAgent(BaseAgent):

    def build_prompt(self, state):

        return FINANCE_PROMPT.format(
            query=state.get("query", ""),
            policy_output=state.get("policy_output", ""),
            environmental_output=state.get("environmental_output", "")
        )
        