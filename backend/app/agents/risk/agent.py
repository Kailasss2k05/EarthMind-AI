from app.core.base_agent import BaseAgent
from app.prompts.risk_prompt import RISK_PROMPT
from app.core.utils import get_agent_data
import json

class RiskAgent(BaseAgent):

    def build_prompt(self, state):

        outputs = state["outputs"]

        return RISK_PROMPT.format(
    research_output=json.dumps(outputs.get("research", {}), indent=2),
    finance_output=json.dumps(outputs.get("finance", {}), indent=2),
    environmental_output=json.dumps(outputs.get("environmental", {}), indent=2),
)