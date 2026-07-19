from app.core.base_agent import BaseAgent
from app.prompts.report_prompt import REPORT_PROMPT
import json


class ReportAgent(BaseAgent):

    returns_json = False

    def build_prompt(self, state):

        outputs = state.get("outputs", {})

        # ---------------------------------
        # Overall Confidence
        # ---------------------------------

        scores = []

        for name, output in outputs.items():

            if name == "report":
                continue

            if isinstance(output, dict):

                score = output.get("confidence_score")

                if isinstance(score, (int, float)):
                    scores.append(score)

        overall_confidence = (
            round(sum(scores) / len(scores), 2)
            if scores else 0.0
        )

        # ---------------------------------
        # Overall Project Status
        # ---------------------------------

        statuses = []

        for name, output in outputs.items():

            if name == "report":
                continue

            if isinstance(output, dict):
                statuses.append(output.get("status", "failed"))

        if "failed" in statuses:
            project_status = "Not Feasible"

        elif "incomplete" in statuses:
            project_status = "Partially Feasible"

        else:
            project_status = "Feasible"

        # ---------------------------------
        # Executed Agents
        # ---------------------------------

        executed_agents = ", ".join(
            agent.title()
            for agent in outputs.keys()
            if agent != "report"
        )

        # ---------------------------------
        # Overall Missing Information
        # ---------------------------------

        missing = set()

        for output in outputs.values():

            if isinstance(output, dict):

                missing.update(
                    output.get("missing_information", [])
                )

        overall_missing = sorted(missing)

        # ---------------------------------
        # Overall Recommendations
        # ---------------------------------

        recommendations = set()

        for output in outputs.values():

            if isinstance(output, dict):

                recommendations.update(
                    output.get("recommendations", [])
                )

        overall_recommendations = sorted(recommendations)

        # Save for report prompt

        state["overall_confidence"] = overall_confidence
        state["project_status"] = project_status
        state["executed_agents"] = executed_agents
        state["overall_missing"] = overall_missing
        state["overall_recommendations"] = overall_recommendations

        overall_recommendations_text = (
            "\n".join(f"- {item}" for item in overall_recommendations)
            if overall_recommendations else "None"
        )

        shared_missing_information_text = (
            "\n".join(f"- {item}" for item in state.get("missing_information", []))
            if state.get("missing_information") else "None"
        )

        return REPORT_PROMPT.format(

            query=state.get("query", ""),

            planner_output=json.dumps(
                state.get("planner_output", {}),
                indent=2
            ),

            research_output=json.dumps(
                outputs.get("research", {}),
                indent=2
            ),

            sdg_output=json.dumps(
                outputs.get("sdg", {}),
                indent=2
            ),

            policy_output=json.dumps(
                outputs.get("policy", {}),
                indent=2
            ),

            environmental_output=json.dumps(
                outputs.get("environmental", {}),
                indent=2
            ),

            finance_output=json.dumps(
                outputs.get("finance", {}),
                indent=2
            ),

            risk_output=json.dumps(
                outputs.get("risk", {}),
                indent=2
            ),

            timeline_output=json.dumps(
                outputs.get("timeline", {}),
                indent=2
            ),

            overall_confidence=overall_confidence,
            project_status=project_status,
            executed_agents=executed_agents,

            overall_missing=json.dumps(
                overall_missing,
                indent=2
            ),

            overall_recommendations=json.dumps(
                overall_recommendations,
                indent=2
            ),

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