from app.core.base_agent import BaseAgent
from app.prompts.policy_prompt import POLICY_PROMPT


class PolicyAgent(BaseAgent):

    def build_prompt(self, state):

        return POLICY_PROMPT.format(
            query=state.get("query", ""),
            research_output=state.get("research_output", ""),
            sdg_output=state.get("sdg_output", "")
        )
