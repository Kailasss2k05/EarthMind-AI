import json

from app.core.base_agent import BaseAgent
from app.prompts.sdg_prompt import SDG_PROMPT
from app.rag.retriever import retrieve


class SDGAgent(BaseAgent):

    def build_prompt(self, state: dict) -> str:
        outputs = state.get("outputs", {})

        evidence = retrieve("sdg", state.get("query", ""))

        if evidence:
            formatted_evidence = "\n\n".join(
                f"Source: {doc.get('source', 'Unknown')}\n"
                f"Page: {doc.get('page', 'N/A')}\n\n"
                f"{doc.get('text', '')}"
                for doc in evidence
            )
        else:
            formatted_evidence = "No relevant documents found in the knowledge base."

        return SDG_PROMPT.format(
            query=state.get("query", ""),
            planner_output=json.dumps(
                state.get("planner_output", {}),
                indent=2,
            ),
            research_output=json.dumps(
                outputs.get("research", {}),
                indent=2,
            ),
            shared_missing_information=json.dumps(
                state.get("missing_information", []),
                indent=2,
            ),
            evidence=formatted_evidence,
        )