"""
manage_documents.py
-------------------
Utility for viewing and managing indexed documents in the RAG database.
"""

from .config import DOMAINS
from .vector_store import (
    list_documents,
    get_or_create_collection,
    delete_document,
)


def main():

    print("=" * 60)
    print("EarthMind AI - Document Manager")
    print("=" * 60)

    total_docs = 0
    total_chunks = 0

    for domain in DOMAINS:

        collection = get_or_create_collection(domain)

        docs = list_documents(domain)
        chunks = collection.count()

        total_docs += len(docs)
        total_chunks += chunks

        print(f"\n{domain.upper()}")
        print("-" * 40)

        if not docs:
            print("No documents indexed.")
            continue

        for i, doc in enumerate(docs, start=1):
            print(f"{i}. {doc}")

        print(f"\nDocuments : {len(docs)}")
        print(f"Chunks    : {chunks}")

    print("\n" + "=" * 60)
    print(f"Total Domains   : {len(DOMAINS)}")
    print(f"Total Documents : {total_docs}")
    print(f"Total Chunks    : {total_chunks}")
    print("=" * 60)

    # -----------------------------
    # Delete document option
    # -----------------------------
    print("\nWould you like to delete a document?")
    choice = input("(y/n): ").strip().lower()

    if choice == "y":

        domain = input("Domain: ").strip().lower()

        filename = input("Filename: ").strip()

        delete_document(domain, filename)

        print("\nUpdated document list:\n")

        docs = list_documents(domain)

        if docs:
            for doc in docs:
                print("-", doc)
        else:
            print("No documents remaining in this domain.")


if __name__ == "__main__":
    main()