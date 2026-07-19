from app.core.base_agent import BaseAgent
from app.prompts.report_prompt import REPORT_PROMPT
import json


class ReportAgent(BaseAgent):

    returns_json = False

    def build_prompt(self, state):

        outputs = state.get("outputs", {})

        scores = []

        for output in state["outputs"].values():

            if isinstance(output, dict):

                score = output.get("confidence_score")

                if isinstance(score, (int, float)):
                    scores.append(score)

        overall = round(sum(scores) / len(scores), 2) if scores else 0.0

        state["overall_confidence"] = overall

        return REPORT_PROMPT.format(
            query=state.get("query", ""),
            planner_output=json.dumps(state.get("planner_output", {}), indent=2),

            research_output=json.dumps(outputs.get("research", {}), indent=2),
            sdg_output=json.dumps(outputs.get("sdg", {}), indent=2),
            policy_output=json.dumps(outputs.get("policy", {}), indent=2),
            environmental_output=json.dumps(outputs.get("environmental", {}), indent=2),
            finance_output=json.dumps(outputs.get("finance", {}), indent=2),
            risk_output=json.dumps(outputs.get("risk", {}), indent=2),
            overall_confidence=state.get("overall_confidence", 0.0),
            timeline_output=json.dumps(outputs.get("timeline", {}), indent=2),
            shared_missing_information=json.dumps(
    state.get("missing_information", []),
    indent=2
),
agent_status=json.dumps(
    state.get("agent_status", {}),
    indent=2
),
errors=json.dumps(
    state.get("errors", {}),
    indent=2
)

        )