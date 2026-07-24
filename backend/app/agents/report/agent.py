from app.core.base_agent import BaseAgent
from app.prompts.report_prompt import REPORT_PROMPT
from app.agents.report.aggregator import build_report_context


class ReportAgent(BaseAgent):

    returns_json = False

    def build_prompt(self, state):

        context = build_report_context(state)

        try:

            prompt = REPORT_PROMPT.format(

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

            return prompt

        except Exception as e:

            print("\n========== REPORT PROMPT ERROR ==========")
            print(repr(e))
            print("=========================================\n")

            raise