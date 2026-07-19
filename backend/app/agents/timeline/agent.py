from app.core.base_agent import BaseAgent
from app.prompts.timeline_prompt import TIMELINE_PROMPT
from app.core.utils import get_agent_data
import json

class TimelineAgent(BaseAgent):

    def build_prompt(self, state):

        outputs = state["outputs"]

        return TIMELINE_PROMPT.format(
    finance_output=json.dumps(outputs.get("finance", {}), indent=2),
    risk_output=json.dumps(outputs.get("risk", {}), indent=2),
)