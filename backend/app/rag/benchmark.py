import time
from app.rag.retriever import retrieve_all

queries = [
    "renewable energy policy",
    "carbon emissions",
    "climate finance",
    "sustainable agriculture",
    "SDG 13 climate action",
]

print("=" * 70)
print("RAG Retrieval Benchmark")
print("=" * 70)

total_time = 0

for query in queries:
    start = time.perf_counter()

    results = retrieve_all(query)

    elapsed = time.perf_counter() - start
    total_time += elapsed

    print(f"\nQuery: {query}")
    print(f"Retrieved {len(results)} documents in {elapsed:.3f} seconds")

average = total_time / len(queries)

print("\n" + "=" * 70)
print(f"Average retrieval time: {average:.3f} seconds")