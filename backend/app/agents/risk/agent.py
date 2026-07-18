from app.core.base_agent import BaseAgent
from app.prompts.risk_prompt import RISK_PROMPT


class RiskAgent(BaseAgent):

    def build_prompt(self, state):

        prompt = RISK_PROMPT.format(
            research_output=state["research_output"],
            finance_output=state["finance_output"],
            environmental_output=state["environmental_output"]
        )

        response = self.llm.invoke(prompt)

        state["risk_output"] = response.content

        return state