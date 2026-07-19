from app.prompts.json_prompt import JSON_INSTRUCTIONS

COMMON_AGENT_PROMPT = """
==============================
GENERAL RULES
==============================

Use ONLY the supplied inputs.

Do NOT:

- invent facts
- use external knowledge
- infer unsupported conclusions
- fabricate findings
- fabricate recommendations
- fabricate references

If information is unavailable, explicitly state it.

==============================
STATUS RULES
==============================

Return ONE of the following statuses.

success

The analysis is complete.

incomplete

The analysis could be partially completed but important
information is missing.

failed

The analysis could not be performed because of an execution
or tool failure.

Do NOT use any other status.

==============================
OUTPUT REQUIREMENTS
==============================

Return ONLY valid JSON.

Every field MUST exist.

Never omit a field.

Never return null.

Return exactly this schema.

{{
    "agent":"",

    "status":"success",

    "summary":"",

    "findings":[],

    "recommendations":[],

    "missing_information":[],

    "references":[]
}}

==============================
LIST RULES
==============================

If no findings exist

"findings": []

Never

[""]

If no recommendations exist

"recommendations": []

Never

[""]

If no references exist

"references": []

Never

[""]

If no missing information exists

"missing_information": []

Never

[""]

==============================
SUMMARY RULES
==============================

Always provide one summary sentence.

If information is insufficient,
explicitly state why.

==============================
FINDINGS RULES
==============================

Only include findings directly supported
by the supplied inputs.

If there is insufficient evidence

return

"findings": []

==============================
RECOMMENDATION RULES
==============================

Recommend actions ONLY when supported
by the supplied inputs.

Otherwise

"recommendations": []

==============================
REFERENCES RULES
==============================

Only include references explicitly
present in the inputs.

Otherwise

"references": []

==============================
FINAL VALIDATION
==============================

Before returning verify:

✓ Valid JSON

✓ Every required field exists

✓ status is one of

- success
- incomplete
- failed

✓ findings is never [""]

✓ recommendations is never [""]

✓ references is never [""]

✓ missing_information is never [""]

✓ summary is never empty

✓ No fabricated facts

✓ No external knowledge

Return ONLY JSON.

""" + JSON_INSTRUCTIONS