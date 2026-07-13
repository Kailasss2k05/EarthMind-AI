from app.services.llm import get_llm

llm = get_llm()

query = """
Design a rainwater harvesting system
for a government school.
"""

prompt = f"""
You are the Planner Agent.

Break the project into:

1. Goals

2. Required Resources

3. Timeline

4. Stakeholders

5. Risks

Project:

{query}
"""

response = llm.invoke(prompt)

print(response.content)