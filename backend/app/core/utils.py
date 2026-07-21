from typing import Dict, List, Any, Optional


def get_agent_data(state: dict, agent_name: str) -> Dict[str, str]:
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


def build_references_from_chunks(chunks: List[dict]) -> List[str]:
    """
    Build a de-duplicated list of reference strings from retrieved RAG chunks.

    Format: "<source_filename> - page <page_number>"

    Used by ResearchAgent and all downstream agents to populate the
    ``references`` field from ``state["retrieved_context"]``.
    """
    seen: set = set()
    refs: List[str] = []
    for chunk in chunks:
        source = chunk.get("source") or "unknown"
        page = chunk.get("page", "?")
        ref = f"{source} - page {page}"
        if ref not in seen:
            seen.add(ref)
            refs.append(ref)
    return refs


def format_chunks_as_references(chunks: List[dict]) -> str:
    """
    Format retrieved chunks into a compact reference list string
    for injection into agent prompts.

    Returns a bullet-list string, or a sentinel if no chunks exist.
    """
    if not chunks:
        return "No documents retrieved from the knowledge base."

    refs = build_references_from_chunks(chunks)
    return "\n".join(f"- {r}" for r in refs)

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
    score += min(len(findings), 5) * 0.10
    score += min(len(recommendations), 5) * 0.05
    score += min(len(references), 5) * 0.05

    # Penalize missing information
    score -= min(len(missing), 10) * 0.02

    # Status adjustment
    if status == "success":
        score += 0.15
    elif status == "incomplete":
        score -= 0.05

    # Clamp to valid range
    score = max(0.0, min(1.0, score))

    return round(score, 2)

def fallback_response(agent_name: str, error: str) -> dict:
    """
    Standard fallback response when an agent fails.
    """

    fallback_missing = {
        "research": [
            "Technical specifications",
            "Existing solutions",
            "System architecture",
        ],
        "policy": [
            "Local regulations",
            "Permit requirements",
            "Compliance requirements",
        ],
        "environmental": [
            "Carbon reduction estimates",
            "Environmental impact data",
        ],
        "finance": [
            "Installation cost",
            "Funding source",
            "Maintenance cost",
        ],
        "risk": [
            "Risk assessment",
            "Mitigation strategy",
        ],
        "timeline": [
            "Project phases",
            "Milestones",
            "Implementation sequence",
        ],
        "sdg": [
            "Relevant SDGs",
            "Sustainability indicators",
        ],
    }

    return {
        "agent": agent_name,
        "status": "failed",
        "confidence_score": 0.0,
        "summary": (
            f"{agent_name.capitalize()} agent could not complete its analysis "
            "because an execution error occurred."
        ),
        "findings": [],
        "recommendations": [],
        "missing_information": fallback_missing.get(agent_name, []),
        "references": [],
        "error": error,
    }