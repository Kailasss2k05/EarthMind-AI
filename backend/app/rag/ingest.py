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
"""

from .config import DOMAINS, RAW_DATA_DIR
from .pdf_loader import load_pdf_text
from .chunker import chunk_records
from .embedder import embed_texts
from .vector_store import (
    add_chunks_to_collection,
    get_or_create_collection,
    is_pdf_indexed,
)


def ingest_domain(domain: str):

    print(f"\n{'=' * 50}")
    print(f"Processing Domain: {domain}")
    print(f"{'=' * 50}")

    folder = RAW_DATA_DIR / domain

    if not folder.exists():
        print(f"Folder not found: {folder}")
        return

    pdf_files = sorted(folder.glob("*.pdf"))

    if not pdf_files:
        print("No PDFs found.")
        return

    processed = 0
    skipped = 0

    for pdf_path in pdf_files:

        if is_pdf_indexed(domain, pdf_path.name):
            print(f"Skipping {pdf_path.name} (already indexed)")
            skipped += 1
            continue

        print(f"\nReading {pdf_path.name}...")

        pages = load_pdf_text(pdf_path)

        if not pages:
            print("No readable text found.")
            continue

        page_records = [
            {
                "source": pdf_path.name,
                "page": p["page"],
                "text": p["text"],
            }
            for p in pages
        ]

        print(f"Loaded {len(page_records)} pages.")

        chunks = chunk_records(page_records)
        print(f"Generated {len(chunks)} chunks.")

        print("Generating embeddings...")
        texts = [c["text"] for c in chunks]
        embeddings = embed_texts(texts)

        print("Saving to ChromaDB...")
        add_chunks_to_collection(domain, chunks, embeddings)

        processed += 1

    collection = get_or_create_collection(domain)

    print("\nSummary")
    print(f"Processed : {processed}")
    print(f"Skipped   : {skipped}")
    print(f"Total Chunks : {collection.count()}")


def main():

    print("=" * 60)
    print("EarthMind AI - Automatic PDF Ingestion Pipeline")
    print("=" * 60)

    total_pdfs = 0

    for domain in DOMAINS:
        folder = RAW_DATA_DIR / domain

        if folder.exists():
            count = len(list(folder.glob("*.pdf")))
            total_pdfs += count
            print(f"{domain:<15}: {count} PDF(s)")
        else:
            print(f"{domain:<15}: Folder not found")

    print(f"\nTotal PDFs : {total_pdfs}")

    for domain in DOMAINS:
        ingest_domain(domain)

    print("\nIngestion completed.")


if __name__ == "__main__":
    main()