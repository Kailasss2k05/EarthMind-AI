from app.core.base_agent import BaseAgent
from app.prompts.research_prompt import RESEARCH_PROMPT
from app.rag.retriever import retrieve


class ResearchAgent(BaseAgent):

    def build_prompt(self, state):

        evidence = retrieve("research", state["query"])

        formatted_evidence = "\n\n".join(
            f"Source: {doc['source']}\n"
            f"Page: {doc['page']}\n\n"
            f"{doc['text']}"
            for doc in evidence
        )

        return RESEARCH_PROMPT.format(
            query=state["query"],
            evidence=formatted_evidence,
        )