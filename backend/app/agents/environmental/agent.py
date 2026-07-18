from app.core.base_agent import BaseAgent
from app.prompts.environmental_prompt import ENVIRONMENTAL_PROMPT


class EnvironmentalAgent(BaseAgent):

    def build_prompt(self, state):

        return ENVIRONMENTAL_PROMPT.format(
            query=state.get("query", ""),
            research_output=state.get("research_output", ""),
            policy_output=state.get("policy_output", "")
        )