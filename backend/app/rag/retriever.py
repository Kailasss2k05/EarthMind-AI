"""
retriever.py
------------
This is the "Agentic RAG foundation" piece: a single, reusable function
that any agent (SDG agent, Policy agent, Finance agent, etc.) will call
later to get grounded evidence for its sub-query.

This is intentionally simple today - just embed the query and search
one domain's collection. Re-ranking / multi-domain fan-out (shown in
Figure 3.4) can be layered on top of this function later without
changing how agents call it.
"""

from .config import DEFAULT_TOP_K
from .embedder import embed_texts
from .vector_store import get_or_create_collection


def retrieve(domain: str, query: str, top_k: int = DEFAULT_TOP_K) -> list[dict]:
    """
    Search a domain's ChromaDB collection for chunks relevant to `query`.

    This is the function an agent will call, e.g.:
        retrieve(domain="sdg", query="renewable energy targets for SDG 7")

    Returns a list of results, most relevant first:
        [
          {"text": "...", "source": "sdg_report.pdf", "page": 4, "distance": 0.21},
          ...
        ]
    `distance` = how far apart the meanings are (lower = more relevant).
    """
    collection = get_or_create_collection(domain)

    if collection.count() == 0:
        print(f"Warning: collection '{domain}' is empty. "
              f"Run ingest.py first to populate it.")
        return []

    query_embedding = embed_texts([query])[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
    )

    output = []
    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    for doc, meta, dist in zip(documents, metadatas, distances):
        output.append({
            "text": doc,
            "source": meta.get("source"),
            "page": meta.get("page"),
            "distance": dist,
        })

    return output
