import json

from app.core.base_agent import BaseAgent
from app.prompts.timeline_prompt import TIMELINE_PROMPT


class TimelineAgent(BaseAgent):

    def build_prompt(self, state: dict) -> str:
        outputs = state.get("outputs", {})

        return TIMELINE_PROMPT.format(
            query=state.get("query", ""),
            planner_output=json.dumps(
                state.get("planner_output", {}),
                indent=2,
            ),
            finance_output=json.dumps(
                outputs.get("finance", {}),
                indent=2,
            ),
            risk_output=json.dumps(
                outputs.get("risk", {}),
                indent=2,
            ),
            shared_missing_information=json.dumps(
                state.get("missing_information", []),
                indent=2,
            ),
        )