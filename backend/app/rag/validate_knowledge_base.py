from app.rag.config import DOMAINS
from app.rag.vector_store import get_or_create_collection


def main():

    print("=" * 70)
    print("EarthMind AI - Knowledge Base Validation")
    print("=" * 70)

    healthy = True

    for domain in DOMAINS:

        collection = get_or_create_collection(domain)

        count = collection.count()

        print(f"\nDomain : {domain}")
        print(f"Chunks : {count}")

        if count == 0:
            healthy = False
            print("❌ No indexed documents found.")
        else:
            print("✅ Collection available.")

    print("\n" + "=" * 70)

    if healthy:
        print("Knowledge Base Validation PASSED")
    else:
        print("Knowledge Base Validation FAILED")

    print("=" * 70)


if __name__ == "__main__":
    main()