from app.core.base_agent import BaseAgent

from app.tools.policy import get_policy

from app.prompts.policy_prompt import POLICY_PROMPT


class PolicyAgent(BaseAgent):

    def build_prompt(self, state):

        policy = get_policy(

            state["query"]

        )

        return POLICY_PROMPT.format(

            query=state["query"],

            policy=policy

        )