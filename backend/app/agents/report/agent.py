"""
report/agent.py
---------------
Report Agent — compiles the final Markdown report from all agent outputs.

Design
------
- Uses ``build_report_context()`` from aggregator.py to extract and format
  all structured data from the GraphState.
- Formats the context into a REPORT_PROMPT and calls the LLM.
- Returns raw Markdown text (returns_json = False).
- Does NOT store any data back into state — that is the node's job.
"""

import logging

from app.core.base_agent import BaseAgent
from app.prompts.report_prompt import REPORT_PROMPT
from app.agents.report.aggregator import build_report_context

logger = logging.getLogger(__name__)


class ReportAgent(BaseAgent):
    """Synthesizes all agent outputs into a final Markdown report."""

    # Report returns Markdown, not JSON.
    returns_json = False

    def build_prompt(self, state: dict) -> str:
        """
        Build the report prompt by aggregating all agent outputs.

        Raises on prompt-building failure so the node can catch it
        and emit an agent_failed WebSocket event.
        """
        try:
            context = build_report_context(state)

            return REPORT_PROMPT.format(
                query=context["query"],
                project_status=context["project_status"],
                overall_confidence=context["overall_confidence"],
                completed_agents=", ".join(context["completed_agents"]) or "None",
                incomplete_agents=", ".join(context["incomplete_agents"]) or "None",
                failed_agents=", ".join(context["failed_agents"]) or "None",
                skipped_agents=", ".join(context["skipped_agents"]) or "None",
                research_section=context["research_section"],
                sdg_section=context["sdg_section"],
                policy_section=context["policy_section"],
                environmental_section=context["environmental_section"],
                finance_section=context["finance_section"],
                risk_section=context["risk_section"],
                timeline_section=context["timeline_section"],
                recommendations_section=context["recommendations_section"],
                missing_information_section=context["missing_information_section"],
                execution_table=context["execution_table"],
                errors_section=context["errors_section"],
            )

        except Exception as e:
            logger.error(
                "\n========== REPORT PROMPT ERROR ==========\n%r\n=========================================",
                e,
            )
            raise

    def run(self, state: dict) -> str:
        """
        Generate the Markdown report.

        Overrides BaseAgent.run() to return raw text (returns_json=False).
        The base class already handles this case — if returns_json is False,
        it returns the raw LLM response content directly.
        """
        return super().run(state)
