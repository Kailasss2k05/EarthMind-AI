from app.rag.retriever import retrieve_all

TEST_QUERIES = [
    "renewable energy policy",
    "carbon emissions",
    "climate finance",
    "sustainable agriculture",
    "SDG 13 climate action",
]

for query in TEST_QUERIES:
    print("=" * 70)
    print("Query:", query)

    results = retrieve_all(query)

    for i, r in enumerate(results, 1):
        print(
            f"{i}. {r['source']} "
            f"(page {r['page']}) "
            f"[{r['domain']}] "
            f"score={r['hybrid_score']:.3f}"
        )
        