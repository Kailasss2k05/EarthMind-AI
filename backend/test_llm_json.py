from dotenv import load_dotenv
load_dotenv()  # Load GROQ_API_KEY and other vars from backend/.env

import os
from langchain_groq import ChatGroq

llm = ChatGroq(
    model="openai/gpt-oss-20b",
    groq_api_key=os.environ["GROQ_API_KEY"],
    temperature=0,
)

llm_json = llm.bind(response_format={"type": "json_object"})

prompt = """
Return ONLY this JSON:

{
  "objective": "finance",
  "required_agents": ["finance"]
}
"""

response = llm_json.invoke(prompt)

print(response.content)