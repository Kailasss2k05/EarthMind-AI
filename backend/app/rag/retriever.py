"""
retriever.py
------------
Reusable retrieval layer for all RAG agents.

Supports:
- Single-domain hybrid retrieval
- Multi-domain hybrid retrieval
- Query normalization
- Distance-based result filtering
"""

from .config import DEFAULT_TOP_K, DOMAINS, MAX_DISTANCE
from .embedder import embed_texts
from .vector_store import get_or_create_collection


def keyword_score(text: str, query: str) -> int:
    """
    Count how many query words appear in the text.
    """

    text = text.lower()
    words = query.lower().split()

    score = 0

    for word in words:
        score += text.count(word)

    return score


def retrieve(domain: str, query: str, top_k: int = DEFAULT_TOP_K) -> list[dict]:
    """
    Search a single domain collection using hybrid search
    (semantic similarity + keyword matching).
    """

    # Normalize query
    query = query.strip().lower()

    collection = get_or_create_collection(domain)

    if collection.count() == 0:
        print(
            f"Warning: collection '{domain}' is empty. "
            f"Run ingest.py first."
        )
        return []

    # Generate embedding
    query_embedding = embed_texts([query])[0]

    # Semantic search
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
    )

    output = []

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    for doc, meta, dist in zip(documents, metadatas, distances):

        # Skip poor semantic matches
        if dist > MAX_DISTANCE:
            continue

        output.append(
            {
                "text": doc,
                "source": meta.get("source"),
                "page": meta.get("page"),
                "domain": meta.get("domain"),
                "distance": dist,
                "keyword_score": keyword_score(doc, query),
            }
        )

    # Hybrid ranking
    for item in output:
        semantic_score = 1 / (1 + item["distance"])
        item["hybrid_score"] = semantic_score + (0.2 * item["keyword_score"])

    # Sort by hybrid score
    output.sort(key=lambda x: x["hybrid_score"], reverse=True)

    return output


def retrieve_all(query: str, top_k: int = DEFAULT_TOP_K) -> list[dict]:
    """
    Search all domain collections and return the best matches.
    """

    query = query.strip().lower()

    all_results = []

    for domain in DOMAINS:

        results = retrieve(domain, query, top_k)

        for r in results:
            if r.get("domain") is None:
                r["domain"] = domain

        all_results.extend(results)

    # Global hybrid ranking
    all_results.sort(key=lambda x: x["hybrid_score"], reverse=True)

    return all_results[:top_k]