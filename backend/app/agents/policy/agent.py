from app.core.base_agent import BaseAgent
from app.prompts.policy_prompt import POLICY_PROMPT
from app.rag.retriever import retrieve


class PolicyAgent(BaseAgent):

    def build_prompt(self, state):

        policy_docs = retrieve("policy", state["query"])


        prompt = POLICY_PROMPT.format(
            query=state["query"],
            research_output=state["research_output"],
            sdg_output=state["sdg_output"]
        )

        response = self.llm.invoke(prompt)

        state["policy_output"] = response.content

        return state