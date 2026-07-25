import json

from app.core.base_agent import BaseAgent
from app.core.utils import build_references_from_chunks
from app.prompts.finance_prompt import FINANCE_PROMPT
from app.tools.budget import BudgetInput, BudgetTool
from app.tools.executor import execute_tool_with_metadata


class FinanceAgent(BaseAgent):

    def build_prompt(self, state: dict) -> str:
        outputs = state.get("outputs", {})

        # -----------------------------
        # Budget Tool
        # -----------------------------
        budget_data = state.get("budget_input", {})

        budget = BudgetInput(
            equipment_cost=budget_data.get("equipment_cost", 0),
            labor_cost=budget_data.get("labor_cost", 0),
            land_cost=budget_data.get("land_cost", 0),
            other_cost=budget_data.get("other_cost", 0),
            subsidy=budget_data.get("subsidy", 0),
            annual_maintenance=budget_data.get("annual_maintenance", 0),
            annual_savings=budget_data.get("annual_savings", 0),
            project_lifetime=budget_data.get("project_lifetime", 20),
        )

        budget_analysis = execute_tool_with_metadata(
            state,
            "BudgetTool",
            "Finance",
            BudgetTool.analyze,
            budget,
        )

        # -----------------------------
        # Build Prompt
        # -----------------------------
        return FINANCE_PROMPT.format(
            query=state.get("query", ""),

            planner_output=json.dumps(
                state.get("planner_output", {}),
                indent=2,
            ),

            policy_output=json.dumps(
                outputs.get("policy", {}),
                indent=2,
            ),

            environmental_output=json.dumps(
                outputs.get("environmental", {}),
                indent=2,
            ),

            budget_analysis=json.dumps(
                budget_analysis,
                indent=2,
            ),

            shared_missing_information=json.dumps(
                state.get("missing_information", []),
                indent=2,
            ),
        )

    def run(self, state: dict) -> dict:
        """
        Run Finance Agent.

        If the model returns no references,
        populate them from retrieved_context.
        """

        result = super().run(state)

        if isinstance(result, dict) and not result.get("references"):
            chunks = state.get("retrieved_context", [])
            result["references"] = build_references_from_chunks(chunks)

        return result