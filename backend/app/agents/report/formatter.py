from typing import Dict, List


def confidence_label(score: float | None) -> str:
    if score is None:
        return "N/A"

    if score >= 0.80:
        return "High"

    if score >= 0.60:
        return "Medium"

    return "Low"


def format_list(items: List[str]) -> str:
    if not items:
        return "None"

    return "\n".join(f"- {item}" for item in items)


def format_findings(findings: List[Dict]) -> str:

    if not findings:
        return "None"

    lines = []

    for finding in findings:

        lines.append(
            f"- **{finding.get('type','Unknown').title()}**: "
            f"{finding.get('description','')}"
        )

    return "\n".join(lines)


def format_recommendations(recommendations: List[Dict]) -> str:

    if not recommendations:
        return "None"

    lines = []

    for rec in recommendations:

        lines.append(
            f"- **{rec.get('action','')}**\n"
            f"  - {rec.get('rationale','')}"
        )

    return "\n\n".join(lines)


def format_missing_information(items: List[Dict]) -> str:

    if not items:
        return "None"

    lines = []

    for item in items:

        lines.append(
            f"- **{item.get('type','Unknown').title()}**\n"
            f"  - {item.get('description','')}"
        )

    return "\n\n".join(lines)


def format_references(refs: List[str]) -> str:

    if not refs:
        return "None"

    return "\n".join(f"- {r}" for r in refs)


def _to_dict(output) -> Dict:
    """
    Ensure an agent output is always a dict.

    If the LLM returned raw text (a str) instead of structured JSON,
    wrap it so all downstream .get() calls are safe.
    """
    if isinstance(output, dict):
        return output
    if isinstance(output, str):
        return {"summary": output, "findings": [], "recommendations": [],
                "missing_information": [], "references": [], "confidence_score": None}
    return {}


def format_agent_section(title: str,
                         output,
                         status: str) -> str:

    output = _to_dict(output)  # guard: coerce str → dict
    confidence = output.get("confidence_score")

    return f"""
# {title}

**Status:** {status}

**Confidence:** {confidence if confidence is not None else "N/A"} ({confidence_label(confidence)})

## Summary

{output.get("summary","None")}

## Findings

{format_findings(output.get("findings", []))}

## Recommendations

{format_recommendations(output.get("recommendations", []))}

## Missing Information

{format_missing_information(output.get("missing_information", []))}

## References

{format_references(output.get("references", []))}
""".strip()


def format_execution_table(agent_status: Dict[str, str]) -> str:

    table = [
        "| Agent | Status |",
        "|------|------|"
    ]

    for agent, status in agent_status.items():

        table.append(
            f"| {agent.title()} | {status.title()} |"
        )

    return "\n".join(table)


def format_errors(errors: Dict) -> str:

    if not errors:
        return "No execution errors occurred."

    lines = []

    for agent, error in errors.items():

        lines.append(f"- **{agent.title()}**: {error}")

    return "\n".join(lines)


def format_tool_summary(tool_executions: List[Dict]) -> str:
    if not tool_executions:
        return "No tool executions recorded."

    lines = []
    for t in tool_executions:
        tool_name = t.get("tool_name", "Tool")
        status = t.get("status", "Completed")
        summary = t.get("error") or t.get("output_summary") or t.get("summary") or "Completed"
        lines.append(f"{tool_name}\n{status}\n{summary}")

    return "\n\n".join(lines)