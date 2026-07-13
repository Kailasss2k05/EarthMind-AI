"""
ingest.py
---------
THE MAIN SCRIPT. Run this file to build the whole knowledge base.

What it does, step by step, for every domain folder in data/raw/:
  1. Load all PDFs in that folder and extract their text  (pdf_loader.py)
  2. Split that text into overlapping chunks                (chunker.py)
  3. Turn each chunk into an embedding vector               (embedder.py)
  4. Save chunks + embeddings into that domain's ChromaDB
     collection                                             (vector_store.py)

Run it from the backend/ folder like this:
    python -m app.rag.ingest
"""

from .config import DOMAINS, RAW_DATA_DIR
from .pdf_loader import load_all_pdfs_in_folder
from .chunker import chunk_records
from .embedder import embed_texts
from .vector_store import add_chunks_to_collection, get_or_create_collection


def ingest_domain(domain: str):
    print(f"\n=== Domain: {domain} ===")
    folder = RAW_DATA_DIR / domain

    if not folder.exists():
        print(f"  folder does not exist yet: {folder}")
        return

    # 1. Load PDFs -> page-level text
    page_records = load_all_pdfs_in_folder(folder)
    if not page_records:
        print(f"  Nothing to ingest for '{domain}' yet - add PDFs to {folder}")
        return

    # 2. Chunk
    chunks = chunk_records(page_records)
    print(f"  {len(page_records)} pages -> {len(chunks)} chunks")

    # 3. Embed
    texts = [c["text"] for c in chunks]
    embeddings = embed_texts(texts)

    # 4. Store in ChromaDB
    add_chunks_to_collection(domain, chunks, embeddings)
    collection = get_or_create_collection(domain)
    print(f"  Stored. '{domain}' collection now has {collection.count()} chunks total.")


def main():
    print("Starting ingestion into ChromaDB...")
    print(f"Reading raw documents from: {RAW_DATA_DIR}")

    for domain in DOMAINS:
        ingest_domain(domain)

    print("\nDone. Run `python -m app.rag.test_retrieval` to try a search.")


if __name__ == "__main__":
    main()
