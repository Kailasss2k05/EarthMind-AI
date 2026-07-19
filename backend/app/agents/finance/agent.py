from app.core.base_agent import BaseAgent
from app.prompts.finance_prompt import FINANCE_PROMPT
from app.core.utils import get_agent_data
import json

class FinanceAgent(BaseAgent):

    def build_prompt(self, state):

        outputs = state["outputs"]

        return FINANCE_PROMPT.format(
    query=state.get("query", ""),
    policy_output=json.dumps(outputs.get("policy", {}), indent=2),
    environmental_output=json.dumps(outputs.get("environmental", {}), indent=2),
)