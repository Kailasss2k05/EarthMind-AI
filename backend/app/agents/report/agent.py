from app.core.base_agent import BaseAgent
from app.prompts.report_prompt import REPORT_PROMPT


class ReportAgent(BaseAgent):

    def build_prompt(self, state):

        return REPORT_PROMPT.format(
    query=state.get("query", ""),

    planner_output=state.get("planner_output", ""),

    research_output=f"""
----- START RESEARCH -----
{state.get("research_output","")}
----- END RESEARCH -----
""",

    sdg_output=f"""
----- START SDG -----
{state.get("sdg_output","")}
----- END SDG -----
""",

    policy_output=f"""
----- START POLICY -----
{state.get("policy_output","")}
----- END POLICY -----
""",

    environmental_output=f"""
----- START ENVIRONMENT -----
{state.get("environmental_output","")}
----- END ENVIRONMENT -----
""",

    finance_output=f"""
----- START FINANCE -----
{state.get("finance_output","")}
----- END FINANCE -----
""",

    risk_output=f"""
----- START RISK -----
{state.get("risk_output","")}
----- END RISK -----
""",

    timeline_output=f"""
----- START TIMELINE -----
{state.get("timeline_output","")}
----- END TIMELINE -----
"""
)