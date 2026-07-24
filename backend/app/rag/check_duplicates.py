from collections import Counter

from app.rag.config import DOMAINS
from app.rag.vector_store import get_or_create_collection


def main():

    print("=" * 70)
    print("EarthMind AI - Duplicate Document Check")
    print("=" * 70)

    duplicates_found = False

    for domain in DOMAINS:

        collection = get_or_create_collection(domain)

        data = collection.get(
            include=["metadatas"]
        )

        ids = data["ids"]

        counter = Counter(ids)

        duplicates = {
            k: v
            for k, v in counter.items()
            if v > 1
        }

        print(f"\nDomain: {domain}")

        if duplicates:
            duplicates_found = True
            print(f"❌ {len(duplicates)} duplicate IDs found")
        else:
            print("✅ No duplicate IDs")

    print("\n" + "=" * 70)

    if duplicates_found:
        print("Duplicate check FAILED")
    else:
        print("Duplicate check PASSED")

    print("=" * 70)


if __name__ == "__main__":
    main()