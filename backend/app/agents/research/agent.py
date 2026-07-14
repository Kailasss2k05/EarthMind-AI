from app.core.base_agent import BaseAgent

from app.prompts.research_prompt import RESEARCH_PROMPT

from app.tools.search import search_documents


class ResearchAgent(BaseAgent):

    def build_prompt(self, state):

        evidence = search_documents(

            state["query"]

        )

        return RESEARCH_PROMPT.format(

            query=state["query"],

            evidence=evidence

        )