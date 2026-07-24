from app.core.base_agent import BaseAgent
from app.prompts.planner_prompt import PLANNER_PROMPT


class PlannerAgent(BaseAgent):

    def build_prompt(self, state):
        return PLANNER_PROMPT.format(query=state["query"])

    def run(self, state: dict) -> dict:
        result = super().run(state)

        if not isinstance(result, dict):
            result = {"status": "failed", "required_agents": []}

        required_agents = result.get("required_agents", [])
        if not isinstance(required_agents, list):
            required_agents = []

        query = state.get("query", "").lower()

        # Deterministic fallback routing — mirrors the prompt's selection rules
        # so the correct agents are always activated even if the LLM fails.
        rules = {
            "timeline": [
                "roadmap", "implementation roadmap", "implementation plan",
                "implementation strategy", "timeline", "milestones", "phases",
                "rollout", "execution plan", "five-year", "ten-year",
                "annual plan", "quarterly plan", "deployment schedule",
                "action plan", "step-by-step",
            ],
            "finance": [
                "budget", "cost", "investment", "funding", "economic",
                "financial", "roi", "pricing", "capital", "revenue",
                "capex", "opex", "subsidy", "grant",
            ],
            "risk": [
                "risk", "challenge", "barrier", "uncertainty", "failure",
                "hazard", "resilience", "vulnerability", "safety", "threat",
                "mitigation",
            ],
            "environmental": [
                "environment", "environmental", "emissions", "pollution",
                "carbon", "climate", "ecosystem", "biodiversity", "air quality",
                "co2", "ghg", "net zero", "sustainability", "electric vehicle",
                "electric bus", "clean energy",
            ],
            "policy": [
                "policy", "government", "law", "regulation", "compliance",
                "scheme", "mission", "guideline", "mandate", "directive",
                "framework", "permit", "governance", "legislation",
            ],
            "sdg": [
                "sdg", "sustainable development goal", "agenda 2030",
                "un goals", "goal 1", "goal 2", "goal 3", "goal 4", "goal 5",
                "goal 6", "goal 7", "goal 8", "goal 9", "goal 10", "goal 11",
                "goal 12", "goal 13", "goal 14", "goal 15", "goal 16", "goal 17",
            ],
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