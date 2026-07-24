JSON_INSTRUCTIONS = """
========================
OUTPUT FORMAT (STRICT)
========================

Return ONLY one valid JSON object.

Rules:

1. Do NOT write any explanation.
2. Do NOT write any introduction.
3. Do NOT write any conclusion.
4. Do NOT use Markdown.
5. Do NOT use ```json.
6. Do NOT wrap the JSON inside code blocks.
7. Do NOT include comments.
8. Do NOT include notes.
9. Do NOT include any text before the JSON.
10. Do NOT include any text after the JSON.

The FIRST character of your response MUST be:

{{

The LAST character of your response MUST be:

}}

Every key and string MUST use double quotes.

Return valid RFC-8259 JSON.

If information is unavailable, use:

- ""
- []
- {{}}

Never invent information.

Never estimate numerical values.

Never fabricate references.

Return exactly this schema:

{{
    "agent": "",
    "status": "success",
    "summary": "",
    "findings": [],
    "recommendations": [],
    "missing_information": [],
    "references": []
}}
"""