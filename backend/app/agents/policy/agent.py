import json

from app.core.base_agent import BaseAgent
from app.core.utils import build_references_from_chunks
from app.prompts.policy_prompt import POLICY_PROMPT
from app.tools.policy import PolicyInput, PolicyTool
from app.tools.executor import execute_tool_with_metadata


class PolicyAgent(BaseAgent):

    def build_prompt(self, state: dict) -> str:
        outputs = state.get("outputs", {})

        # -----------------------------
        # Policy Tool
        # -----------------------------
        policy_data = state.get("policy_input", {})

        policy = PolicyInput(
            project_type=policy_data.get("project_type", ""),
            location=policy_data.get("location", ""),
            capacity_kw=policy_data.get("capacity_kw", 0),
            land_area_sq_m=policy_data.get("land_area_sq_m", 0),
            protected_area=policy_data.get("protected_area", False),
        )

        policy_analysis = execute_tool_with_metadata(
            state,
            "PolicyTool",
            "Policy",
            PolicyTool.analyze,
            policy,
        )

        # -----------------------------
        # Build Prompt
        # -----------------------------
        return POLICY_PROMPT.format(
            query=state.get("query", ""),

            planner_output=json.dumps(
                state.get("planner_output", {}),
                indent=2,
            ),

            research_output=json.dumps(
                outputs.get("research", {}),
                indent=2,
            ),

            sdg_output=json.dumps(
                outputs.get("sdg", {}),
                indent=2,
            ),

            policy_analysis=json.dumps(
                policy_analysis,
                indent=2,
            ),

            shared_missing_information=json.dumps(
                state.get("missing_information", []),
                indent=2,
            ),
        )

    def run(self, state: dict) -> dict:
        """
        Run Policy Agent.

        If the model returns no references,
        populate them from retrieved_context.
        """

        result = super().run(state)

        if isinstance(result, dict) and not result.get("references"):
            chunks = state.get("retrieved_context", [])
            result["references"] = build_references_from_chunks(chunks)

        return result