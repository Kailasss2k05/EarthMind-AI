from app.core.base_agent import BaseAgent
from app.prompts.sdg_prompt import SDG_PROMPT


class SDGAgent(BaseAgent):

    def build_prompt(self, state):

        return SDG_PROMPT.format(
            query=state["query"],
            research_output=state["research_output"]
        )