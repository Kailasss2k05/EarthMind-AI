import json

from app.core.base_agent import BaseAgent
from app.core.utils import build_references_from_chunks
from app.prompts.risk_prompt import RISK_PROMPT


class RiskAgent(BaseAgent):

    def build_prompt(self, state: dict) -> str:
        outputs = state.get("outputs", {})

        return RISK_PROMPT.format(
            query=state.get("query", ""),
            planner_output=json.dumps(
                state.get("planner_output", {}),
                indent=2,
            ),
            research_output=json.dumps(
                outputs.get("research", {}),
                indent=2,
            ),
            finance_output=json.dumps(
                outputs.get("finance", {}),
                indent=2,
            ),
            environmental_output=json.dumps(
                outputs.get("environmental", {}),
                indent=2,
            ),
            shared_missing_information=json.dumps(
                state.get("missing_information", []),
                indent=2,
            ),
        )

    def run(self, state: dict) -> dict:
        """Run with post-processing: populate references from retrieved_context if empty."""
        result = super().run(state)
        if isinstance(result, dict) and not result.get("references"):
            chunks = state.get("retrieved_context", [])
            result["references"] = build_references_from_chunks(chunks)
        return result