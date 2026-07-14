from app.core.base_agent import BaseAgent
from app.prompts.finance_prompt import FINANCE_PROMPT
from app.tools.budget import estimate_budget


class FinanceAgent(BaseAgent):

    def build_prompt(self, state):

        budget = estimate_budget(state["query"])

        return FINANCE_PROMPT.format(
            query=state["query"],
            budget=budget,
        )