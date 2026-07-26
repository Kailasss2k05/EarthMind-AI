"""
nodes.py
--------
LangGraph node functions for the EarthMind AI multi-agent pipeline.

Each node function:
1. Broadcasts a WebSocket "agent_started" event.
2. Runs the agent.
3. Updates state (outputs, agent_status, errors, missing_information).
4. Broadcasts a WebSocket "agent_completed" or "agent_failed" event.
5. Returns the mutated state.

The agents are module-level singletons so they are only instantiated once.
Two separate LLM instances are used:
  - ``llm_json``  : JSON-mode Groq (Planner + all domain agents)
  - ``llm_text``  : Text-mode Groq (Report agent — returns Markdown)
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
    update_agent_status,
    update_error,
    update_missing_information,
)
from app.orchestrator.agent_executor import _run_async
from app.websocket.events import (
    broadcast_agent_started,
    broadcast_agent_completed,
    broadcast_agent_failed,
)
from app.services.llm import get_llm

# ── LLM singletons ───────────────────────────────────────────────────────────
llm_json = get_llm(json_mode=True)   # All domain agents + planner
llm_text = get_llm(json_mode=False)  # Report agent (returns Markdown)

# ── Agent singletons ─────────────────────────────────────────────────────────
planner     = PlannerAgent(llm_json)
research    = ResearchAgent(llm_json)
sdg         = SDGAgent(llm_json)
policy      = PolicyAgent(llm_json)
environmental = EnvironmentalAgent(llm_json)
finance     = FinanceAgent(llm_json)
risk        = RiskAgent(llm_json)
timeline    = TimelineAgent(llm_json)
report      = ReportAgent(llm_text)


# ── Helper: run an agent with full WebSocket lifecycle broadcasting ───────────

def _run_agent(state: dict, name: str, agent) -> dict:
    """
    Broadcast started → run agent → update state → broadcast completed/failed.
    Returns the agent output dict.
    """
    display_name = "SDG" if name.lower() == "sdg" else name.title()
    _run_async(broadcast_agent_started(display_name))
    try:
        output = agent.run(state)
        _run_async(broadcast_agent_completed(display_name))
        return output
    except Exception as exc:
        _run_async(broadcast_agent_failed(display_name, str(exc)))
        return {
            "status": "failed",
            "error": str(exc),
            "summary": "",
            "findings": [],
            "recommendations": [],
            "missing_information": [],
            "references": [],
            "confidence_score": 0.0,
        }


# ── Node functions ────────────────────────────────────────────────────────────

def planner_node(state: dict) -> dict:
    """
    Planner generates a JSON execution plan.
    Sets required_agents, execution_order, and pre-marks skipped agents.
    """
    _run_async(broadcast_agent_started("Planner"))

    result = planner.run(state)

    required = result.get("required_agents", [])

    state["planner_output"]  = result
    state["required_agents"] = required
    state["execution_order"] = resolve_dependencies(required)

    # Pre-mark agents not in the execution plan as skipped
    for agent in ALL_AGENTS:
        if agent not in state["execution_order"]:
            state["agent_status"][agent] = "skipped"

    _run_async(broadcast_agent_completed("Planner"))
    return state


def research_node(state: dict) -> dict:
    output = _run_agent(state, "research", research)
    # ResearchAgent returns a state patch (outputs + retrieved_context)
    # Handle both cases: patch dict vs direct output dict
    if "outputs" in output and "retrieved_context" in output:
        state["outputs"]["research"] = output["outputs"].get("research", output)
        state["retrieved_context"] = output.get("retrieved_context", [])
    else:
        state["outputs"]["research"] = output
    update_missing_information(state, state["outputs"]["research"])
    update_agent_status(state, "research", state["outputs"]["research"])
    update_error(state, "research", state["outputs"]["research"])
    return state


def sdg_node(state: dict) -> dict:
    output = _run_agent(state, "sdg", sdg)
    state["outputs"]["sdg"] = output
    update_missing_information(state, output)
    update_agent_status(state, "sdg", output)
    update_error(state, "sdg", output)
    return state


def policy_node(state: dict) -> dict:
    output = _run_agent(state, "policy", policy)
    state["outputs"]["policy"] = output
    update_missing_information(state, output)
    update_agent_status(state, "policy", output)
    update_error(state, "policy", output)
    return state


def environmental_node(state: dict) -> dict:
    output = _run_agent(state, "environmental", environmental)
    state["outputs"]["environmental"] = output
    update_missing_information(state, output)
    update_agent_status(state, "environmental", output)
    update_error(state, "environmental", output)
    return state


def finance_node(state: dict) -> dict:
    output = _run_agent(state, "finance", finance)
    state["outputs"]["finance"] = output
    update_missing_information(state, output)
    update_agent_status(state, "finance", output)
    update_error(state, "finance", output)
    return state


def risk_node(state: dict) -> dict:
    output = _run_agent(state, "risk", risk)
    state["outputs"]["risk"] = output
    update_missing_information(state, output)
    update_agent_status(state, "risk", output)
    update_error(state, "risk", output)
    return state


def timeline_node(state: dict) -> dict:
    output = _run_agent(state, "timeline", timeline)
    state["outputs"]["timeline"] = output
    update_missing_information(state, output)
    update_agent_status(state, "timeline", output)
    update_error(state, "timeline", output)
    return state


def report_node(state: dict) -> dict:
    """
    Report agent compiles the final Markdown report from all agent outputs.
    Returns raw Markdown text stored in state["outputs"]["report"].
    """
    _run_async(broadcast_agent_started("Report"))
    try:
        report_text = report.run(state)
        state["outputs"]["report"] = report_text
        _run_async(broadcast_agent_completed("Report"))
    except Exception as exc:
        state["outputs"]["report"] = f"# Report Generation Failed\n\n{exc}"
        _run_async(broadcast_agent_failed("Report", str(exc)))
    return state
