import json

from app.core.base_agent import BaseAgent
from app.prompts.policy_prompt import POLICY_PROMPT


class PolicyAgent(BaseAgent):

    def build_prompt(self, state: dict) -> str:
        outputs = state.get("outputs", {})

        return POLICY_PROMPT.format(
            query=state.get("query", ""),
            planner_output=json.dumps(
                state.get("planner_output", {}),
                indent=2,
            ),
            research_output=json.dumps(
                outputs.get("research", {}),
                indent=2,
            ),
            sdg_output=json.dumps(
                outputs.get("sdg", {}),
                indent=2,
            ),
            shared_missing_information=json.dumps(
                state.get("missing_information", []),
                indent=2,
            ),
        )