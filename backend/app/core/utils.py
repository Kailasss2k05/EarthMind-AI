def get_agent_data(state, agent_name):
    """
    Returns a normalized view of an agent's output.
    """

    output = state["outputs"].get(agent_name, {})

    return {
        "summary": output.get("summary", ""),
        "findings": "\n".join(output.get("findings", [])),
        "recommendations": "\n".join(output.get("recommendations", [])),
        "missing_information": "\n".join(
            output.get("missing_information", [])
        ),
        "references": "\n".join(output.get("references", [])),
    }

import json
import re

REQUIRED_FIELDS = {
    "agent": "",
    "status": "success",
    "summary": "",
    "findings": [],
    "recommendations": [],
    "missing_information": [],
    "references": []
}


def clean_json(content: str) -> str:
    content = content.strip()

    if content.startswith("```"):

        lines = content.splitlines()

        lines = lines[1:]

        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]

        content = "\n".join(lines).strip()

    return content


def extract_json(content: str) -> str:

    match = re.search(r"\{.*\}", content, re.DOTALL)

    if match:
        return match.group()

    return content


def parse_json(content: str) -> dict:

    content = clean_json(content)

    content = extract_json(content)

    return json.loads(content)


def normalize_output(result: dict) -> dict:
    """
    Fill in missing fields and enforce correct data types.
    """

    normalized = {}

    normalized["agent"] = str(result.get("agent", ""))

    normalized["status"] = str(
        result.get("status", "success")
    )

    normalized["summary"] = str(
        result.get("summary", "")
    )

    normalized["findings"] = ensure_list(
        result.get("findings", [])
    )

    normalized["recommendations"] = ensure_list(
        result.get("recommendations", [])
    )

    normalized["missing_information"] = ensure_list(
        result.get("missing_information", [])
    )

    normalized["references"] = ensure_list(
        result.get("references", [])
    )

    return normalized


def ensure_list(value):
    """
    Always return a list.

    Examples

    "abc"
    ->
    ["abc"]

    None
    ->
    []

    ["a","b"]
    ->
    ["a","b"]
    """

    if value is None:
        return []

    if isinstance(value, list):
        return value

    return [str(value)]

def calculate_confidence(result: dict) -> float | None:
    """
    Calculate a deterministic confidence score for an agent output.

    Returns:
        float between 0.0 and 1.0
        None for skipped agents
    """

    status = result.get("status", "").lower()

    if status == "skipped":
        return None

    if status == "failed":
        return 0.0

    score = 0.50  # Base confidence

    findings = result.get("findings", [])
    recommendations = result.get("recommendations", [])
    references = result.get("references", [])
    missing = result.get("missing_information", [])

    # Reward useful information
    score += min(len(findings), 5) * 0.06
    score += min(len(recommendations), 5) * 0.04
    score += min(len(references), 5) * 0.03

    # Penalize missing information
    score -= min(len(missing), 10) * 0.05

    # Status adjustment
    if status == "success":
        score += 0.15
    elif status == "incomplete":
        score -= 0.05

    # Clamp to valid range
    score = max(0.0, min(1.0, score))

    return round(score, 2)