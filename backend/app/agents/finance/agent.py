from app.core.base_agent import BaseAgent
from app.prompts.finance_prompt import FINANCE_PROMPT
from app.tools.budget import estimate_budget


class FinanceAgent(BaseAgent):

    def build_prompt(self, state):

        prompt = FINANCE_PROMPT.format(
            query=state["query"],
            policy_output=state["policy_output"],
            environmental_output=state["environmental_output"]
        )

        response = self.llm.invoke(prompt)

        state["finance_output"] = response.content

        return state