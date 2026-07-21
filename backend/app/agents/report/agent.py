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


def _sanitize_list(items) -> list:
    """
    Return a cleaned list:
    - Remove None entries
    - Remove empty strings
    - Remove blank dict objects (e.g. {"type":"policy","name":""})
    """
    if not isinstance(items, list):
        return []
    cleaned = []
    for item in items:
        if item is None:
            continue
        if isinstance(item, str) and not item.strip():
            continue
        if isinstance(item, dict):
            # Drop objects where every value is empty
            if not any(str(v).strip() for v in item.values()):
                continue
        cleaned.append(item)
    return cleaned


def _sanitize_output(output: dict) -> dict:
    """
    Sanitize a single agent output dict before passing to the report prompt.

    Cleans:
    - findings, recommendations, missing_information, references lists
    - Removes None, empty strings, and blank dict objects from all lists
    """
    if not isinstance(output, dict):
        return output
    result = dict(output)
    for list_field in ("findings", "recommendations", "missing_information", "references"):
        result[list_field] = _sanitize_list(result.get(list_field, []))
    return result


class ReportAgent(BaseAgent):

    # Report returns Markdown, not JSON.
    returns_json = False

    def build_prompt(self, state: dict) -> str:
        outputs = state.get("outputs", {})

        # Sanitize every agent output before building the prompt
        clean_outputs = {
            name: _sanitize_output(output)
            for name, output in outputs.items()
            if name != "report"
        }

        # ── Overall confidence ────────────────────────────────────────────────
        scores = [
            output.get("confidence_score")
            for name, output in clean_outputs.items()
            if isinstance(output, dict)
            and isinstance(output.get("confidence_score"), (int, float))
        ]
        overall_confidence = (
            round(sum(scores) / len(scores), 2) if scores else 0.0
        )

        # ── Overall project status ────────────────────────────────────────────
        statuses = [
            output.get("status", "failed")
            for name, output in clean_outputs.items()
            if isinstance(output, dict)
        ]
        if "failed" in statuses:
            project_status = "Action Required (Errors Occurred)"
        elif "incomplete" in statuses:
            project_status = "Action Required (Information Missing)"
        else:
            project_status = "Ready for Next Steps"

        # ── Executed agents ───────────────────────────────────────────────────
        executed_agents = ", ".join(
            agent.title()
            for agent in clean_outputs.keys()
        )

        # ── Overall missing information ───────────────────────────────────────
        missing_set: set = set()
        for output in clean_outputs.values():
            if isinstance(output, dict):
                missing_set.update(output.get("missing_information", []) or [])
        overall_missing = sorted(missing_set)

        # ── Overall recommendations ───────────────────────────────────────────
        overall_recommendations = []
        for output in clean_outputs.values():
            if isinstance(output, dict):
                for rec in (output.get("recommendations", []) or []):
                    if rec not in overall_recommendations:
                        overall_recommendations.append(rec)

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

            research_output=json.dumps(clean_outputs.get("research", {}), indent=2),
            sdg_output=json.dumps(clean_outputs.get("sdg", {}), indent=2),
            policy_output=json.dumps(clean_outputs.get("policy", {}), indent=2),
            environmental_output=json.dumps(clean_outputs.get("environmental", {}), indent=2),
            finance_output=json.dumps(clean_outputs.get("finance", {}), indent=2),
            risk_output=json.dumps(clean_outputs.get("risk", {}), indent=2),
            timeline_output=json.dumps(clean_outputs.get("timeline", {}), indent=2),

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