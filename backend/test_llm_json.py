from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0,
    format="json",
)

prompt = """
Return ONLY this JSON:

{
  "objective": "finance",
  "required_agents": ["finance"]
}
"""

response = llm.invoke(prompt)

print(response.content)