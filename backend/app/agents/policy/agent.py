from app.core.base_agent import BaseAgent
from app.prompts.policy_prompt import POLICY_PROMPT
import json


class PolicyAgent(BaseAgent):

    def build_prompt(self, state):

        return POLICY_PROMPT.format(
            query=state.get("query", ""),
            planner_output=json.dumps(
                state.get("planner_output", {}),
                indent=2
            ),
            research_output=json.dumps(
                state.get("research_output", {}),
                indent=2
            ),
            sdg_output=json.dumps(
                state.get("sdg_output", {}),
                indent=2
            ),
            shared_missing_information=json.dumps(
                state.get("missing_information", []),
                indent=2
            )
        )