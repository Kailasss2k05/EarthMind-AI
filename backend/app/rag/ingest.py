"""
ingest.py
---------
Automatic PDF ingestion pipeline for EarthMind AI.

Pipeline:
1. Scan all domain folders
2. Load PDFs
3. Split into chunks
4. Generate embeddings
5. Store in ChromaDB

Run:
    python -m app.rag.ingest
"""

from .config import DOMAINS, RAW_DATA_DIR
from .pdf_loader import load_all_pdfs_in_folder
from .chunker import chunk_records
from .embedder import embed_texts
from .vector_store import (
    add_chunks_to_collection,
    get_or_create_collection,
)


def ingest_domain(domain: str):
    """
    Ingest all PDFs belonging to one domain.
    """
    print(f"\n{'=' * 50}")
    print(f"Processing Domain: {domain}")
    print(f"{'=' * 50}")

    folder = RAW_DATA_DIR / domain

    if not folder.exists():
        print(f"Folder not found: {folder}")
        return

    # Load PDFs
    page_records = load_all_pdfs_in_folder(folder)

    if not page_records:
        print(f"No PDF content found in '{domain}'.")
        return

    print(f"Loaded {len(page_records)} pages.")

    # Chunk
    chunks = chunk_records(page_records)
    print(f"Generated {len(chunks)} chunks.")

    # Generate embeddings
    print("Generating embeddings...")
    texts = [c["text"] for c in chunks]
    embeddings = embed_texts(texts)

    # Store
    print("Saving to ChromaDB...")
    add_chunks_to_collection(domain, chunks, embeddings)

    collection = get_or_create_collection(domain)

    print(
        f"Completed '{domain}' "
        f"({collection.count()} chunks stored)"
    )


def main():

    print("=" * 60)
    print("EarthMind AI - Automatic PDF Ingestion Pipeline")
    print("=" * 60)

    print(f"\nKnowledge Base: {RAW_DATA_DIR}\n")

    total_pdfs = 0

    print("Scanning document folders...\n")

    for domain in DOMAINS:

        folder = RAW_DATA_DIR / domain

        if folder.exists():
            pdf_count = len(list(folder.glob("*.pdf")))
            total_pdfs += pdf_count
            print(f"{domain:<15}: {pdf_count} PDF(s)")
        else:
            print(f"{domain:<15}: Folder not found")

    print(f"\nTotal PDFs Found : {total_pdfs}")
    print("\nStarting ingestion...\n")

    for domain in DOMAINS:
        ingest_domain(domain)

    print("\n" + "=" * 60)
    print("Ingestion Completed Successfully")
    print("=" * 60)
    print(f"Domains Processed : {len(DOMAINS)}")
    print(f"Total PDFs        : {total_pdfs}")
    print("\nKnowledge base updated successfully.")
    print("\nNext step:")
    print("python -m app.rag.test_retrieval")


if __name__ == "__main__":
    main()