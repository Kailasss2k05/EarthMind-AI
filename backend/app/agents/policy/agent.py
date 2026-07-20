from app.core.base_agent import BaseAgent
from app.prompts.policy_prompt import POLICY_PROMPT
from app.rag.retriever import retrieve


class PolicyAgent(BaseAgent):

    def build_prompt(self, state):

        evidence = retrieve("policy", state["query"])

        formatted_evidence = "\n\n".join(
            f"Source: {doc['source']}\n"
            f"Page: {doc['page']}\n\n"
            f"{doc['text']}"
            for doc in evidence
        )

        return POLICY_PROMPT.format(
            query=state["query"],
            evidence=formatted_evidence
        )