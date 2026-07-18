from app.core.base_agent import BaseAgent

from app.tools.carbon import carbon_estimate

from app.prompts.environmental_prompt import ENVIRONMENTAL_PROMPT
from backend.app.prompts.finance_prompt import FINANCE_PROMPT


class EnvironmentalAgent(BaseAgent):

    def build_prompt(self,state):

        metrics = carbon_estimate(

            state["query"]

        )
        prompt = ENVIRONMENTAL_PROMPT.format(
            query=state["query"],
            research_output=state["research_output"]
        )

        response = self.llm.invoke(prompt)

        state["environmental_output"] = response.content

        return state

        