from app.core.base_agent import BaseAgent
from app.prompts.policy_prompt import POLICY_PROMPT
from app.core.utils import get_agent_data
import json


class PolicyAgent(BaseAgent):

    def build_prompt(self, state):

        outputs = state.get("outputs", {})

        return POLICY_PROMPT.format(
            query=state.get("query", ""),
<<<<<<< HEAD
<<<<<<< HEAD
            research_output=state.get("research_output", ""),
            sdg_output=state.get("sdg_output", "")
        )
=======
=======
            planner_output=json.dumps(
        state.get("planner_output", {}),
        indent=2
    ),
>>>>>>> ce3322f (IMPLEMENTED planner aware collab)
            research_output=json.dumps(
                outputs.get("research", {}),
                indent=2
            ),
            sdg_output=json.dumps(
                outputs.get("sdg", {}),
                indent=2
<<<<<<< HEAD
            )
        )
>>>>>>> 7efdc55 (standardised agent outputs)
=======
            ),
            shared_missing_information=json.dumps(
            state.get("missing_information", []),
            indent=2
        )
        )
>>>>>>> f6bdd3a (added agent status tracking)
