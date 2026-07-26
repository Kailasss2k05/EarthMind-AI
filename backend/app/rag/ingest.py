"""
ingest.py
---------
Automatic PDF ingestion pipeline for EarthMind AI.

Pipeline:
1. Scan all domain folders
2. Load PDFs
3. Split into chunks
4. Generate embeddings
5. Store in Qdrant Cloud
"""

from pathlib import Path

from .config import DOMAINS, RAW_DATA_DIR
from .pdf_loader import load_pdf_text
from .chunker import chunk_records
from .embedder import embed_texts
from .vector_store import (
    add_chunks_to_collection,
    get_or_create_collection,
    is_pdf_indexed,
)


def ingest_uploaded_pdf(domain: str, pdf_path: Path) -> dict:
    """
    Ingest a single PDF document.
    Returns metadata about the ingestion.
    """
    if is_pdf_indexed(domain, pdf_path.name):
        return {
            "filename": pdf_path.name,
            "domain": domain,
            "pages": 0,
            "chunks": 0,
            "collection": domain,
            "indexed": False
        }

    pages = load_pdf_text(pdf_path)

    if not pages:
        return {
            "filename": pdf_path.name,
            "domain": domain,
            "pages": 0,
            "chunks": 0,
            "collection": domain,
            "indexed": False
        }

    page_records = [
        {
            "source": pdf_path.name,
            "page": p["page"],
            "text": p["text"],
        }
        for p in pages
    ]

    chunks = chunk_records(page_records)
    texts = [c["text"] for c in chunks]
    embeddings = embed_texts(texts)

    add_chunks_to_collection(domain, chunks, embeddings)

    return {
        "filename": pdf_path.name,
        "domain": domain,
        "pages": len(page_records),
        "chunks": len(chunks),
        "collection": domain,
        "indexed": True
    }


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
        print(f"\nProcessing {pdf_path.name}...")
        result = ingest_uploaded_pdf(domain, pdf_path)
        
        if not result["indexed"]:
            print(f"Skipping {pdf_path.name} (already indexed or unreadable)")
            skipped += 1
            continue
            
        print(f"Loaded {result['pages']} pages.")
        print(f"Generated {result['chunks']} chunks.")
        print("Saved to Qdrant.")
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