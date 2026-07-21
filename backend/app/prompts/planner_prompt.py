from app.prompts.planner_json_prompt import PLANNER_JSON_INSTRUCTIONS

PLANNER_PROMPT = """
==============================
PLANNER RULES
==============================

Analyze the user's query and select the agents required to answer it.

You MUST choose one or more agents.

The required_agents list MUST NEVER be empty.

Always include "research" unless the query is entirely about a single
specialized domain where research adds no value.

Choose ONLY from:

- research
- sdg
- policy
- environmental
- finance
- risk
- timeline

Do NOT invent agent names.

==============================
USER QUERY
==============================

{query}

==============================
ROUTING GUIDE
==============================

Use this table to determine which agents to include.

If ANY of the listed keywords appear in the query (in any form, including
synonyms or closely related terms), include the corresponding agent.

timeline
    Trigger keywords:
    roadmap, implementation roadmap, implementation plan, timeline, milestones,
    deployment schedule, deployment roadmap, rollout, phases, five-year, 5-year, three-year, 3-year,
    two-year, 2-year, annual plan, quarterly plan, implementation strategy,
    execution plan, phased approach, workplan, Gantt, sequencing,
    step-by-step plan, year-by-year

finance
    Trigger keywords:
    budget, investment, funding, grants, ROI, return on investment,
    CAPEX, capital expenditure, OPEX, operational expenditure,
    cost, costs, financial, revenue, expenditure, payback,
    economic feasibility, cost-benefit, financial model,
    capital, financing, loan, subsidy, tax incentive, profit

risk
    Trigger keywords:
    risk, risks, uncertainty, uncertainties, disaster, hazard, hazards,
    vulnerability, vulnerabilities, resilience, safety, threat, threats,
    mitigation, contingency, failure mode, downside, exposure,
    climate risk, operational risk, reputational risk, transition risk

policy
    Trigger keywords:
    regulation, regulations, government, compliance, ministry,
    legislation, policy, policies, regulatory, permit, legal,
    standard, framework, law, mandate, directive, governance,
    CSRD, TCFD, EU Green Deal, municipal, national, international,
    obligation, reporting requirement, disclosure

environmental
    Trigger keywords:
    biodiversity, ecosystem, ecosystems, forest, forests, emissions,
    pollution, climate, carbon, greenhouse, habitat, deforestation,
    sustainability, ecology, ecological, carbon footprint, net zero,
    carbon neutral, GHG, CO2, environmental impact, water, air quality,
    land use, nature-based, green infrastructure

sdg
    Trigger keywords:
    SDG, SDGs, Sustainable Development Goal, Sustainable Development Goals,
    Agenda 2030, UN Goals, UN targets, global goals, Goal 1, Goal 2,
    Goal 3, Goal 4, Goal 5, Goal 6, Goal 7, Goal 8, Goal 9, Goal 10,
    Goal 11, Goal 12, Goal 13, Goal 14, Goal 15, Goal 16, Goal 17,
    SDG 1 through SDG 17

==============================
SELECTION RULES
==============================

1. Read the full query.

2. Check EVERY keyword in the ROUTING GUIDE.

3. For each keyword that appears, add the corresponding agent
   to required_agents.

4. IMPORTANT: Timeline Agent MUST be selected whenever the user's intent involves planning over time or the deliverable contains chronological planning (e.g., roadmaps, schedules, phased rollouts).

4. Always include "research" unless you have specific reason not to.

5. Never select an agent that is completely irrelevant to the query.

6. If multiple agents are triggered, include all of them.

==============================
OUTPUT REQUIREMENTS
==============================

Return ONLY valid JSON.

Return exactly this schema.

{{
    "objective": "",
    "required_agents": []
}}

==============================
VALIDATION
==============================

Before returning verify:

✓ Valid JSON

✓ objective is not empty and accurately describes the user's goal

✓ required_agents is not empty

✓ Every agent name is valid (from the list above)

✓ No duplicate agents

✓ Timeline is included if query mentions roadmap / timeline / phases / milestones / year plans

✓ Finance is included if query mentions budget / cost / investment / ROI / funding

✓ Risk is included if query mentions risk / hazard / vulnerability / safety / mitigation

✓ Policy is included if query mentions regulation / compliance / government / legislation

✓ Environmental is included if query mentions emissions / carbon / ecosystem / climate

✓ SDG is included if query mentions SDG / Sustainable Development Goals / UN Goals

Return ONLY JSON.
"""

PLANNER_PROMPT += "\n\n" + PLANNER_JSON_INSTRUCTIONS