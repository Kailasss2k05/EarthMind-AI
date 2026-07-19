from app.prompts.planner_json_prompt import PLANNER_JSON_INSTRUCTIONS

PLANNER_PROMPT = """
==============================
PLANNER RULES
==============================

Analyze the user's query and determine which agents should execute.

You MUST choose one or more required agents.

The required_agents list MUST NEVER be empty.

If you are uncertain, include "research".

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

✓ objective is not empty

✓ required_agents is not empty

✓ Every agent name is valid

✓ No duplicate agents

Return ONLY JSON.
"""

PLANNER_PROMPT += "\n\n" + PLANNER_JSON_INSTRUCTIONS