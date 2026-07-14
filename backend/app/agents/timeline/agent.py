from app.core.base_agent import BaseAgent
from app.prompts.timeline_prompt import TIMELINE_PROMPT


class TimelineAgent(BaseAgent):

    def build_prompt(self, state):

        return TIMELINE_PROMPT.format(
            query=state["query"],
            planner=state["planner_output"],
        )