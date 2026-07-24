from app.core.base_agent import BaseAgent
from app.prompts.environmental_prompt import ENVIRONMENTAL_PROMPT
from app.core.utils import get_agent_data
import json

class EnvironmentalAgent(BaseAgent):

    def build_prompt(self, state):

        outputs = state["outputs"]

        return ENVIRONMENTAL_PROMPT.format(
            query=state.get("query", ""),
            planner_output=json.dumps(
        state.get("planner_output", {}),
        indent=2
    ),
            research_output=json.dumps(outputs.get("research", {}), indent=2),
            policy_output=json.dumps(outputs.get("policy", {}), indent=2),
            shared_missing_information=json.dumps(
    state.get("missing_information", []),
    indent=2
)
        )