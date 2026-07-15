"""
retriever.py
------------
Reusable retrieval layer for all RAG agents.

Supports:
- Single-domain semantic retrieval
- Multi-domain semantic retrieval
"""

from .config import DEFAULT_TOP_K, DOMAINS
from .embedder import embed_texts
from .vector_store import get_or_create_collection


def retrieve(domain: str, query: str, top_k: int = DEFAULT_TOP_K) -> list[dict]:
    """
    Search a single domain collection.
    """
    collection = get_or_create_collection(domain)

    if collection.count() == 0:
        print(
            f"Warning: collection '{domain}' is empty. "
            f"Run ingest.py first."
        )
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
        output.append(
            {
                "text": doc,
                "source": meta.get("source"),
                "page": meta.get("page"),
                "domain": meta.get("domain"),
                "distance": dist,
            }
        )

    return output


def retrieve_all(query: str, top_k: int = DEFAULT_TOP_K) -> list[dict]:
    """
    Search all domain collections and return the best matches.
    """

    all_results = []

    for domain in DOMAINS:
        results = retrieve(domain, query, top_k)

        for r in results:
            if r.get("domain") is None:
                r["domain"] = domain

        all_results.extend(results)

    all_results.sort(key=lambda x: x["distance"])

    return all_results[:top_k]