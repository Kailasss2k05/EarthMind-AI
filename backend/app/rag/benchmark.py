"""
benchmark.py
------------
RAG retrieval latency benchmark.

Run from the backend directory:
    python -m app.rag.benchmark
"""

import time

from app.rag.retriever import retrieve_all

QUERIES = [
    "renewable energy policy",
    "carbon emissions",
    "climate finance",
    "sustainable agriculture",
    "SDG 13 climate action",
]


def main():
    print("=" * 70)
    print("RAG Retrieval Benchmark")
    print("=" * 70)

    total_time = 0.0

    for query in QUERIES:
        start = time.perf_counter()
        results = retrieve_all(query)
        elapsed = time.perf_counter() - start
        total_time += elapsed
        print(f"\nQuery   : {query}")
        print(f"Results : {len(results)} documents")
        print(f"Elapsed : {elapsed:.3f} s")

    average = total_time / len(QUERIES)
    print("\n" + "=" * 70)
    print(f"Average retrieval time: {average:.3f} s")
    print("=" * 70)


if __name__ == "__main__":
    main()