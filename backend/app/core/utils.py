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