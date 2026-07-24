from typing import Dict, List

from app.agents.report.formatter import (
    format_agent_section,
    format_execution_table,
    format_recommendations,
    format_missing_information,
    format_errors,
)


def merge_recommendations(outputs: Dict) -> List[dict]:
    recommendations = []
    seen = set()

    for output in outputs.values():

        if not isinstance(output, dict):
            continue

        for rec in output.get("recommendations", []):

            if not isinstance(rec, dict):
                continue

            action = rec.get("action")

            if action and action not in seen:
                recommendations.append(rec)
                seen.add(action)

    return recommendations


def merge_missing_information(outputs: Dict) -> List[dict]:
    missing = []
    seen = set()

    for output in outputs.values():

        if not isinstance(output, dict):
            continue

        for item in output.get("missing_information", []):

            if not isinstance(item, dict):
                continue

            description = item.get("description")

            if description and description not in seen:
                missing.append(item)
                seen.add(description)

    return missing


def calculate_confidence(outputs: Dict) -> float:
    scores = []

    for output in outputs.values():

        if not isinstance(output, dict):
            continue

        score = output.get("confidence_score")

        if isinstance(score, (int, float)):
            scores.append(score)

    if not scores:
        return 0.0

    return round(sum(scores) / len(scores), 2)


def categorize_agents(agent_status: Dict[str, str]):

    completed = []
    incomplete = []
    failed = []
    skipped = []

    for agent, status in agent_status.items():

        if status == "completed":
            completed.append(agent)

        elif status == "incomplete":
            incomplete.append(agent)

        elif status == "failed":
            failed.append(agent)

        elif status == "skipped":
            skipped.append(agent)

    return {
        "completed": completed,
        "incomplete": incomplete,
        "failed": failed,
        "skipped": skipped,
    }


def determine_project_status(categories):

    if categories["failed"]:
        return "Not Feasible"

    if categories["incomplete"]:
        return "Partially Feasible"

    return "Feasible"


def build_report_context(state):

    outputs = state.get("outputs", {})
    agent_status = state.get("agent_status", {})
    errors = state.get("errors", {})

    overall_recommendations = merge_recommendations(outputs)
    overall_missing_information = merge_missing_information(outputs)

    overall_confidence = calculate_confidence(outputs)

    categories = categorize_agents(agent_status)

    project_status = determine_project_status(categories)

    context = {

        "query": state.get("query", ""),

        "project_status": project_status,

        "overall_confidence": overall_confidence,

        "completed_agents": categories["completed"],

        "incomplete_agents": categories["incomplete"],

        "failed_agents": categories["failed"],

        "skipped_agents": categories["skipped"],

        "execution_table": format_execution_table(agent_status),

        "research_section": format_agent_section(
            "Research Analysis",
            outputs.get("research", {}),
            agent_status.get("research", "skipped"),
        ),

        "sdg_section": format_agent_section(
            "SDG Analysis",
            outputs.get("sdg", {}),
            agent_status.get("sdg", "skipped"),
        ),

        "policy_section": format_agent_section(
            "Policy Analysis",
            outputs.get("policy", {}),
            agent_status.get("policy", "skipped"),
        ),

        "environmental_section": format_agent_section(
            "Environmental Assessment",
            outputs.get("environmental", {}),
            agent_status.get("environmental", "skipped"),
        ),

        "finance_section": format_agent_section(
            "Financial Assessment",
            outputs.get("finance", {}),
            agent_status.get("finance", "skipped"),
        ),

        "risk_section": format_agent_section(
            "Risk Assessment",
            outputs.get("risk", {}),
            agent_status.get("risk", "skipped"),
        ),

        "timeline_section": format_agent_section(
            "Timeline Assessment",
            outputs.get("timeline", {}),
            agent_status.get("timeline", "skipped"),
        ),

        "recommendations_section": format_recommendations(
            overall_recommendations
        ),

        "missing_information_section": format_missing_information(
            overall_missing_information
        ),

        "errors_section": format_errors(errors),
    }

    return context