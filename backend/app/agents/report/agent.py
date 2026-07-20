"""
report/agent.py
---------------
Report Agent — compiles the final Markdown report from all agent outputs.

Design note
-----------
``build_prompt()`` is a pure function.  It computes derived values
(overall_confidence, project_status, etc.) as local variables only and
passes them to REPORT_PROMPT.format().  It does NOT write back to ``state``.
"""

import json

from app.core.base_agent import BaseAgent
from app.prompts.report_prompt import REPORT_PROMPT


class ReportAgent(BaseAgent):

    # Report returns Markdown, not JSON.
    returns_json = False

    def build_prompt(self, state: dict) -> str:
        outputs = state.get("outputs", {})

        # ── Overall confidence ────────────────────────────────────────────────
        scores = [
            output.get("confidence_score")
            for name, output in outputs.items()
            if name != "report" and isinstance(output, dict)
            and isinstance(output.get("confidence_score"), (int, float))
        ]
        overall_confidence = (
            round(sum(scores) / len(scores), 2) if scores else 0.0
        )

        # ── Overall project status ────────────────────────────────────────────
        statuses = [
            output.get("status", "failed")
            for name, output in outputs.items()
            if name != "report" and isinstance(output, dict)
        ]
        if "failed" in statuses:
            project_status = "Not Feasible"
        elif "incomplete" in statuses:
            project_status = "Partially Feasible"
        else:
            project_status = "Feasible"

        # ── Executed agents ───────────────────────────────────────────────────
        executed_agents = ", ".join(
            agent.title()
            for agent in outputs.keys()
            if agent != "report"
        )

        # ── Overall missing information ───────────────────────────────────────
        missing_set: set = set()
        for output in outputs.values():
            if isinstance(output, dict):
                missing_set.update(output.get("missing_information", []) or [])
        overall_missing = sorted(missing_set)

        # ── Overall recommendations ───────────────────────────────────────────
        rec_set: set = set()
        for output in outputs.values():
            if isinstance(output, dict):
                rec_set.update(output.get("recommendations", []) or [])
        overall_recommendations = sorted(rec_set)

        # ── Format list fields for prompt ─────────────────────────────────────
        overall_recommendations_text = (
            "\n".join(f"- {item}" for item in overall_recommendations)
            if overall_recommendations else "None"
        )
        shared_missing_text = (
            "\n".join(f"- {item}" for item in state.get("missing_information", []))
            if state.get("missing_information") else "None"
        )

        return REPORT_PROMPT.format(
            query=state.get("query", ""),

            planner_output=json.dumps(
                state.get("planner_output", {}),
                indent=2,
            ),

            research_output=json.dumps(outputs.get("research", {}), indent=2),
            sdg_output=json.dumps(outputs.get("sdg", {}), indent=2),
            policy_output=json.dumps(outputs.get("policy", {}), indent=2),
            environmental_output=json.dumps(outputs.get("environmental", {}), indent=2),
            finance_output=json.dumps(outputs.get("finance", {}), indent=2),
            risk_output=json.dumps(outputs.get("risk", {}), indent=2),
            timeline_output=json.dumps(outputs.get("timeline", {}), indent=2),

            overall_confidence=overall_confidence,
            project_status=project_status,
            executed_agents=executed_agents,

            overall_missing=json.dumps(overall_missing, indent=2),
            overall_recommendations=json.dumps(overall_recommendations, indent=2),

            shared_missing_information=json.dumps(
                state.get("missing_information", []),
                indent=2,
            ),

            agent_status=json.dumps(
                state.get("agent_status", {}),
                indent=2,
            ),

            errors=json.dumps(
                state.get("errors", {}),
                indent=2,
            ),
        )