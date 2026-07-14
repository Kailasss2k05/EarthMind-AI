from app.core.base_agent import BaseAgent

from app.tools.carbon import carbon_estimate

from app.prompts.environmental_prompt import ENVIRONMENTAL_PROMPT


class EnvironmentalAgent(BaseAgent):

    def build_prompt(self,state):

        metrics = carbon_estimate(

            state["query"]

        )

        return ENVIRONMENTAL_PROMPT.format(

            query=state["query"],

            metrics=metrics

        )