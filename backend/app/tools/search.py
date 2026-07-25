"""
Temporary Search Tool

Later this will connect to
DuckDuckGo / Tavily / ChromaDB.
"""

def search_documents(query: str) -> str:
    """
    Returns temporary search results for the given query.
    """

    return f"""
Search Results

Topic:
{query}

Information:

• Rainwater harvesting can reduce freshwater consumption.

• Schools benefit from rooftop collection systems.

• Government incentives exist for sustainable infrastructure.

• UN SDG 6 and SDG 13 are relevant.
"""