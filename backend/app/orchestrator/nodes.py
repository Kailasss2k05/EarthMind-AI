"""
nodes.py
--------
LangGraph node functions — one per agent.

Design contract
---------------
• Every node receives the full ``GraphState`` dict (read-only by convention).
• Every node returns a **partial state patch** — only the keys that changed.
  LangGraph merges this patch into the running state via dict.update().
• No node mutates the input ``state`` dict directly.
• WebSocket lifecycle events are broadcast around every agent call.
"""

from app.agents.planner import PlannerAgent
from app.agents.research import ResearchAgent
from app.agents.sdg import SDGAgent
from app.agents.policy import PolicyAgent
from app.agents.environmental import EnvironmentalAgent
from app.agents.finance import FinanceAgent
from app.agents.risk import RiskAgent
from app.agents.timeline import TimelineAgent
from app.agents.report import ReportAgent

from app.orchestrator.dependencies import resolve_dependencies
from app.orchestrator.helpers import (
    ALL_AGENTS,
    merge_missing_information,
    updated_agent_status,
    updated_errors,
)
from app.orchestrator.agent_executor import _run_async
from app.websocket.events import (
    broadcast_agent_started,
    broadcast_agent_completed,
    broadcast_agent_failed,
)
from app.services.llm import get_llm, get_planner_llm
import logging

logger = logging.getLogger(__name__)

# ── Lazy LLM initialisation ───────────────────────────────────────────────────
# get_llm() is called once, the first time a node executes, not at import time.
# This prevents application startup failures when Ollama is temporarily down.

_llm = None


def _get_llm():
    global _llm
    if _llm is None:
        _llm = get_llm()
    return _llm


# ── Agent singletons (also lazy) ─────────────────────────────────────────────

_agents: dict = {}

planner = PlannerAgent(llm)
research = ResearchAgent(llm)
sdg = SDGAgent(llm)
policy = PolicyAgent(llm)
environmental = EnvironmentalAgent(llm)
finance = FinanceAgent(llm)
risk = RiskAgent(llm)
timeline = TimelineAgent(llm)
report_agent = ReportAgent(get_llm(json_mode=False))

def _agent(name: str):
    if name not in _agents:
        llm = _get_llm()
        mapping = {
            "planner":     PlannerAgent,
            "research":    ResearchAgent,
            "sdg":         SDGAgent,
            "policy":      PolicyAgent,
            "environmental": EnvironmentalAgent,
            "finance":     FinanceAgent,
            "risk":        RiskAgent,
            "timeline":    TimelineAgent,
            "report":      ReportAgent,
        }
        _agents[name] = mapping[name](get_planner_llm() if name == "planner" else llm)
    return _agents[name]


# ── Shared node helper ────────────────────────────────────────────────────────

def _run_agent_node(state: dict, agent_name: str, display_name: str) -> dict:
    """
    Execute a standard analysis agent and return a state patch.

    Broadcasts WebSocket events (started / completed / failed).
    Updates ``outputs``, ``agent_status``, ``errors``, and
    ``missing_information`` in the returned patch.
    """
    _run_async(broadcast_agent_started(display_name))

    current_outputs      = dict(state.get("outputs", {}))
    current_status       = dict(state.get("agent_status", {}))
    current_errors       = dict(state.get("errors", {}))
    current_missing      = list(state.get("missing_information", []))

    try:
        output = _agent(agent_name).run(state)
        _run_async(broadcast_agent_completed(display_name))
    except Exception as exc:
        _run_async(broadcast_agent_failed(display_name, str(exc)))
        raise

    new_outputs  = {**current_outputs, agent_name: output}
    new_status   = updated_agent_status(current_status,  agent_name, output)
    new_errors   = updated_errors(current_errors, agent_name, output)
    new_missing  = merge_missing_information(current_missing, output)

    return {
        "outputs":             new_outputs,
        "agent_status":        new_status,
        "errors":              new_errors,
        "missing_information": new_missing,
    }


    state["execution_order"] = resolve_dependencies(required)
    print("Required:", required)
    print("Execution Order:", state["execution_order"])
    from app.orchestrator.helpers import ALL_AGENTS

def planner_node(state: dict) -> dict:
    """
    Run the Planner agent.

    Returns a patch containing:
    - planner_output     : structured plan dict from the LLM
    - required_agents    : list of agent names the planner selected
    - execution_order    : dependency-resolved execution sequence
    - agent_status       : skipped agents pre-marked as "skipped"
    """
    _run_async(broadcast_agent_started("Planner"))

    try:
        result = _agent("planner").run(state)
        _run_async(broadcast_agent_completed("Planner"))
    except Exception as exc:
        _run_async(broadcast_agent_failed("Planner", str(exc)))
        raise

    required       = result.get("required_agents", [])
    # Filter out any invalid names the LLM may have hallucinated
    valid_required = [a for a in required if a in ALL_AGENTS]
    if not valid_required:
        # Planner must always select at least research as a safe fallback
        valid_required = ["research"]

    execution_order = resolve_dependencies(valid_required)

    # Pre-mark every agent NOT in the execution plan as "skipped"
    current_status = dict(state.get("agent_status", {}))
    for agent in ALL_AGENTS:
        if agent not in execution_order:
            current_status[agent] = "skipped"

    logger.info(
        "[Planner] Selected agents: %s | Execution order: %s",
        ", ".join(valid_required),
        " → ".join(execution_order),
    )

    return {
        "planner_output":  result,
        "required_agents": valid_required,
        "execution_order": execution_order,
        "agent_status":    current_status,
    }


# ── Analysis agent nodes ──────────────────────────────────────────────────────

def research_node(state: dict) -> dict:
    """
    Run the Research agent.

    ResearchAgent.run() returns a full state patch:
        {
            "outputs":          {..., "research": <agent_output>},
            "retrieved_context": [<chunks>],
        }

    We unpack that patch here and also update agent_status, errors,
    and missing_information — identical bookkeeping to _run_agent_node.
    """
    _run_async(broadcast_agent_started("Research"))

    current_outputs = dict(state.get("outputs", {}))
    current_status  = dict(state.get("agent_status", {}))
    current_errors  = dict(state.get("errors", {}))
    current_missing = list(state.get("missing_information", []))

    try:
        patch = _agent("research").run(state)
        _run_async(broadcast_agent_completed("Research"))
    except Exception as exc:
        _run_async(broadcast_agent_failed("Research", str(exc)))
        raise

    # Extract the research output dict from the patch
    output          = patch.get("outputs", {}).get("research", {})
    retrieved_ctx   = patch.get("retrieved_context", [])

    new_outputs = {**current_outputs, "research": output}
    new_status  = updated_agent_status(current_status, "research", output)
    new_errors  = updated_errors(current_errors, "research", output)
    new_missing = merge_missing_information(current_missing, output)

    return {
        "outputs":              new_outputs,
        "agent_status":        new_status,
        "errors":              new_errors,
        "missing_information": new_missing,
        "retrieved_context":   retrieved_ctx,
    }


def sdg_node(state: dict) -> dict:
    return _run_agent_node(state, "sdg", "SDG")


def policy_node(state: dict) -> dict:
    return _run_agent_node(state, "policy", "Policy")


def environmental_node(state: dict) -> dict:
    return _run_agent_node(state, "environmental", "Environmental")


def finance_node(state: dict) -> dict:
    return _run_agent_node(state, "finance", "Finance")


def risk_node(state: dict) -> dict:
    return _run_agent_node(state, "risk", "Risk")


def timeline_node(state: dict) -> dict:
    return _run_agent_node(state, "timeline", "Timeline")


# ── Report node ───────────────────────────────────────────────────────────────

def report_node(state: dict) -> dict:
    """
    Run the Report agent.

    The report agent returns Markdown text (returns_json = False).
    Its output is stored under state["outputs"]["report"].
    No agent_status / errors update is needed because the report
    is always the terminal node.
    """
    _run_async(broadcast_agent_started("Report"))

    current_outputs = dict(state.get("outputs", {}))

    try:
        report_text = _agent("report").run(state)
        _run_async(broadcast_agent_completed("Report"))
    except Exception as exc:
        _run_async(broadcast_agent_failed("Report", str(exc)))
        raise

def report_node(state):
    state["outputs"]["report"] = report_agent.run(state)
    return state
