"""
test_retrieval.py
------------------
A small command-line tool to test semantic retrieval.

Supports:
- Single-domain retrieval
- Multi-domain retrieval ("all")
"""

from .config import DOMAINS
from .retriever import retrieve, retrieve_all


def main():
    print("=== Semantic Retrieval Test ===")
    print(f"Available domains: {', '.join(DOMAINS)}")
    print("Type 'all' to search across every domain.")
    print("(Ctrl+C to quit)\n")

    while True:
        domain = input("Domain (or 'all'): ").strip().lower()

        if domain != "all" and domain not in DOMAINS:
            print(f"Unknown domain. Choose from: {', '.join(DOMAINS)} or 'all'")
            continue

        query = input("Question: ").strip()

        if not query:
            continue

        if domain == "all":
            results = retrieve_all(query, top_k=5)
        else:
            results = retrieve(domain, query, top_k=5)

        if not results:
            print("No results found.\n")
            continue

        print(f"\nTop {len(results)} result(s):")

        for i, result in enumerate(results, start=1):
            preview = result["text"][:200].replace("\n", " ")

            print(
                f"\n[{i}] "
                f"[{result.get('domain', 'N/A')}] "
                f"{result['source']} "
                f"(page {result['page']}, distance {result['distance']:.3f})"
            )

            print(f"    {preview}...")

        print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nBye!")