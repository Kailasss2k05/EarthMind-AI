from app.core.base_agent import BaseAgent
from app.prompts.report_prompt import REPORT_PROMPT


class ReportAgent(BaseAgent):

    def build_prompt(self, state):

        prompt = REPORT_PROMPT.format(
            planner_output=state["planner_output"],
            research_output=state["research_output"],
            sdg_output=state["sdg_output"],
            policy_output=state["policy_output"],
            environmental_output=state["environmental_output"],
            finance_output=state["finance_output"],
            risk_output=state["risk_output"],
            timeline_output=state["timeline_output"]
        )

        response = self.llm.invoke(prompt)

        state["report_output"] = response.content

        return state