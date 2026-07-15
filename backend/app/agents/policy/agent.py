from app.core.base_agent import BaseAgent
from app.prompts.policy_prompt import POLICY_PROMPT
from app.rag.retriever import retrieve


class PolicyAgent(BaseAgent):

    def build_prompt(self, state):

        policy_docs = retrieve("policy", state["query"])

        return POLICY_PROMPT.format(
            query=state["query"],
            policy=policy_docs,
        )