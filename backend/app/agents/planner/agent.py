import re
from app.core.base_agent import BaseAgent
from app.prompts.planner_prompt import PLANNER_PROMPT


class PlannerAgent(BaseAgent):

    def build_prompt(self, state):

        return PLANNER_PROMPT.format(
            query=state["query"]
        )

    def run(self, state: dict) -> dict:
        result = super().run(state)
        
        if not isinstance(result, dict) or result.get("status") == "failed":
            return result
            
        required_agents = result.get("required_agents", [])
        if not isinstance(required_agents, list):
            required_agents = []
            
        query = state.get("query", "").lower()
        
        # Deterministic routing rules
        rules = {
            "timeline": [
                "roadmap", "implementation roadmap", "implementation plan", "implementation strategy",
                "timeline", "milestones", "phases", "rollout", "execution plan", "five-year", "ten-year",
                "annual plan", "quarterly plan", "deployment schedule", "action plan"
            ],
            "finance": [
                "budget", "cost", "investment", "funding", "economic", "financial", "roi", "pricing", "capital"
            ],
            "risk": [
                "risk", "challenge", "barrier", "uncertainty", "failure", "hazard", "resilience"
            ],
            "environmental": [
                "environment", "emissions", "pollution", "carbon", "climate", "ecosystem", "biodiversity", "air quality"
            ],
            "policy": [
                "policy", "government", "law", "regulation", "compliance", "scheme", "mission", "guideline"
            ]
        }
        
        for agent, keywords in rules.items():
            if any(kw in query for kw in keywords):
                if agent not in required_agents:
                    required_agents.append(agent)
                    
        # Ensure research is present, preserve order, remove duplicates
        final_agents = []
        if "research" not in required_agents:
            final_agents.append("research")
        for agent in required_agents:
            if isinstance(agent, str) and agent not in final_agents:
                final_agents.append(agent)
                
        result["required_agents"] = final_agents
        return result