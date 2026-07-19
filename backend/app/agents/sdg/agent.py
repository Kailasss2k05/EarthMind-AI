from app.core.base_agent import BaseAgent
from app.prompts.sdg_prompt import SDG_PROMPT
from app.core.utils import get_agent_data


class SDGAgent(BaseAgent):

    def build_prompt(self, state):

        outputs = state["outputs"]

        return SDG_PROMPT.format(

            query=state["query"],

            research_output=outputs.get("research", {})
        )