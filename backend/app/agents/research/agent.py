import json

from app.core.base_agent import BaseAgent
from app.prompts.research_prompt import RESEARCH_PROMPT


class ResearchAgent(BaseAgent):

    def build_prompt(self, state):

<<<<<<< HEAD
        evidence = retrieve("research", state["query"])

        return RESEARCH_PROMPT.format(

=======
        return RESEARCH_PROMPT.format(
>>>>>>> 944fcf0 (improved planner logic)
            query=state["query"],
            planner_output=json.dumps(
        state.get("planner_output", {}),
        indent=2
    ),
            shared_missing_information=json.dumps(
    state.get("missing_information", []),
    indent=2
)
        )