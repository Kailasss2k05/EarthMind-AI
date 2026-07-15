from app.core.base_agent import BaseAgent
from app.prompts.sdg_prompt import SDG_PROMPT


class SDGAgent(BaseAgent):

    def build_prompt(self, state):

        return SDG_PROMPT.format(

            query=state["query"],

            research=state["research_output"]

        )