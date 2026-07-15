from app.core.base_agent import BaseAgent

from app.prompts.research_prompt import RESEARCH_PROMPT

from app.rag.retriever import retrieve


class ResearchAgent(BaseAgent):

    def build_prompt(self, state):

        evidence = retrieve("research", state["query"])

        return RESEARCH_PROMPT.format(

            query=state["query"],

            evidence=evidence

        )