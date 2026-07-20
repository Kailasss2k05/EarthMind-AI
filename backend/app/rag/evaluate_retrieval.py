"""
evaluate_retrieval.py
---------------------
Manual evaluation script for the RAG retrieval pipeline.

Run from the backend directory:
    python -m app.rag.evaluate_retrieval
"""

from app.rag.retriever import retrieve_all

TEST_QUERIES = [
    "renewable energy policy",
    "carbon emissions",
    "climate finance",
    "sustainable agriculture",
    "SDG 13 climate action",
]


def main():
    for query in TEST_QUERIES:
        print("=" * 70)
        print("Query:", query)

        results = retrieve_all(query)

        if not results:
            print("  No results returned.")
            continue

        for i, r in enumerate(results, 1):
            print(
                f"  {i}. {r.get('source', 'unknown')} "
                f"(page {r.get('page', '?')}) "
                f"[{r.get('domain', '?')}] "
                f"score={r.get('hybrid_score', 0):.3f}"
            )


if __name__ == "__main__":
    main()