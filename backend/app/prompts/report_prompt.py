REPORT_PROMPT = """
# EarthMind AI Analysis Report

User Query:
{query}

Project Status:
{project_status}

Overall Confidence:
{overall_confidence}

Completed Agents:
{completed_agents}

Incomplete Agents:
{incomplete_agents}

Failed Agents:
{failed_agents}

Skipped Agents:
{skipped_agents}

You are the Report Agent.

Your task is to generate a professional Markdown report.

Rules:

- Use ONLY the supplied information.
- Do NOT invent facts.
- Do NOT change the supplied sections.
- Write ONLY:
    1. Executive Summary
    2. Final Decision

Then append the supplied sections exactly as provided.

# Executive Summary

(Write here)

{research_section}

{sdg_section}

{policy_section}

{environmental_section}

{finance_section}

{risk_section}

{timeline_section}

# Overall Recommendations

{recommendations_section}

# Overall Missing Information

{missing_information_section}

# Tool Execution Summary

{tool_summary_section}

# Agent Execution Summary

{execution_table}

# Execution Errors

{errors_section}

# Final Decision

(Write here)
"""