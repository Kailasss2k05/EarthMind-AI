from app.core.base_agent import BaseAgent
from app.prompts.sdg_prompt import SDG_PROMPT
from app.core.utils import get_agent_data
import json

class SDGAgent(BaseAgent):

    def build_prompt(self, state):

        outputs = state["outputs"]

        return SDG_PROMPT.format(

            query=state["query"],

            research_output=outputs.get("research", {}),
            shared_missing_information=json.dumps(
    state.get("missing_information", []),
    indent=2
)
        )