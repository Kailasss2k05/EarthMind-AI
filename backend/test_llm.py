from app.services.llm import get_llm

llm = get_llm()

response = llm.invoke(

    "Introduce yourself."

)

print(response.content)