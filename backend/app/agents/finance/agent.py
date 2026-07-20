import json

from app.core.base_agent import BaseAgent
from app.prompts.finance_prompt import FINANCE_PROMPT


class FinanceAgent(BaseAgent):

    def build_prompt(self, state: dict) -> str:
        outputs = state.get("outputs", {})

        return FINANCE_PROMPT.format(
            query=state.get("query", ""),
            planner_output=json.dumps(
                state.get("planner_output", {}),
                indent=2,
            ),
            policy_output=json.dumps(
                outputs.get("policy", {}),
                indent=2,
            ),
            environmental_output=json.dumps(
                outputs.get("environmental", {}),
                indent=2,
            ),
            shared_missing_information=json.dumps(
                state.get("missing_information", []),
                indent=2,
            ),
        )