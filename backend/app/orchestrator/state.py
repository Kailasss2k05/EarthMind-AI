from typing import TypedDict, Dict, List, Any


class GraphState(TypedDict):
    # ── Input ────────────────────────────────────────────────────────────────
    query: str

    # ── Planner ──────────────────────────────────────────────────────────────
    planner_output: dict

    # ── Execution plan ───────────────────────────────────────────────────────
    required_agents: List[str]
    execution_order: List[str]

    # ── Agent outputs (nested under agent name) ──────────────────────────────
    outputs: Dict[str, Any]

    # ── Shared state updated by every agent ──────────────────────────────────
    agent_status: Dict[str, str]
    errors: Dict[str, str]

    # ── Missing information: list of {type, description} objects ─────────────
    # Each item: {"type": "dataset|policy|...", "description": "..."}
    missing_information: List[Dict[str, str]]

    # ── RAG context populated by ResearchAgent ────────────────────────────────
    retrieved_context: List[dict]