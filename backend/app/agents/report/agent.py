from app.core.base_agent import BaseAgent
from app.prompts.report_prompt import REPORT_PROMPT


class ReportAgent(BaseAgent):

    def build_prompt(self, state):

        return REPORT_PROMPT.format(
            planner=state["planner_output"],
            research=state["research_output"],
            sdg=state["sdg_output"],
            policy=state["policy_output"],
            environment=state["environmental_output"],
            finance=state["finance_output"],
            risk=state["risk_output"],
            timeline=state["timeline_output"],
        )