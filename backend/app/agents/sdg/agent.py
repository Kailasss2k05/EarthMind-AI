import json

from app.core.base_agent import BaseAgent
from app.prompts.sdg_prompt import SDG_PROMPT
from app.rag.retriever import retrieve


class SDGAgent(BaseAgent):

    def build_prompt(self, state):

        outputs = state["outputs"]

        evidence = retrieve("sdg", state["query"])

        formatted_evidence = "\n\n".join(
            f"Source: {doc['source']}\n"
            f"Page: {doc['page']}\n\n"
            f"{doc['text']}"
            for doc in evidence
        )

        return SDG_PROMPT.format(
            query=state["query"],
            planner_output=json.dumps(
                state.get("planner_output", {}),
                indent=2
            ),
            research_output=outputs.get("research", {}),
            shared_missing_information=json.dumps(
                state.get("missing_information", []),
                indent=2
            ),
            evidence=formatted_evidence,
        )