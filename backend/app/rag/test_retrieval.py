"""
test_retrieval.py
------------------
A small command-line tool to sanity-check that semantic search actually
works after you've run ingest.py. This proves your ChromaDB collections
are populated and searchable BEFORE any agent code depends on them.

Run it from the backend/ folder like this:
    python -m app.rag.test_retrieval

Then type a domain (e.g. "sdg") and a question when prompted.
"""

from .config import DOMAINS
from .retriever import retrieve


def main():
    print("=== Semantic Retrieval Test ===")
    print(f"Available domains: {', '.join(DOMAINS)}")
    print("(Ctrl+C to quit)\n")

    while True:
        domain = input("Domain: ").strip().lower()
        if domain not in DOMAINS:
            print(f"Unknown domain. Choose from: {', '.join(DOMAINS)}")
            continue

        query = input("Question: ").strip()
        if not query:
            continue

        results = retrieve(domain, query, top_k=3)

        if not results:
            print("No results (collection may be empty - run ingest.py first).\n")
            continue

        print(f"\nTop {len(results)} results:")
        for i, r in enumerate(results, start=1):
            preview = r["text"][:200].replace("\n", " ")
            print(f"\n[{i}] {r['source']} (page {r['page']}, distance {r['distance']:.3f})")
            print(f"    {preview}...")
        print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nBye!")
