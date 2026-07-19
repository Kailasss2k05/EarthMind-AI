"""
vector_store.py
----------------
ChromaDB vector store utilities.

Each knowledge domain gets its own collection.
Large insertions are automatically split into batches.
"""

import chromadb
from chromadb.utils.batch_utils import create_batches

from .config import VECTOR_STORE_DIR


def get_chroma_client():
    """
    Create/Open persistent ChromaDB database.
    """
    VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=str(VECTOR_STORE_DIR))


def get_or_create_collection(domain: str):
    """
    Return (or create) a collection for a domain.
    """
    client = get_chroma_client()

    return client.get_or_create_collection(
        name=domain,
        metadata={"domain": domain},
    )


def add_chunks_to_collection(
    domain: str,
    chunks: list[dict],
    embeddings: list[list[float]],
):
    """
    Store document chunks in ChromaDB using automatic batching.
    """

    if not chunks:
        return

    collection = get_or_create_collection(domain)

    ids = [
        f"{domain}-{chunk['source']}-p{chunk['page']}-c{chunk['chunk_index']}"
        for chunk in chunks
    ]

    documents = [chunk["text"] for chunk in chunks]

    metadatas = [
        {
            "source": chunk["source"],
            "filename": chunk["source"],
            "page": chunk["page"],
            "domain": domain,
            "chunk_index": chunk["chunk_index"],
            "chunk_length": len(chunk["text"]),
        }
        for chunk in chunks
    ]

    client = get_chroma_client()

    batches = create_batches(
        api=client,
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )

    print(f"Saving {len(ids)} chunks in {len(batches)} batch(es)...")

    for batch in batches:
        batch_ids, batch_embeddings, batch_metadatas, batch_documents = batch

        collection.upsert(
            ids=batch_ids,
            embeddings=batch_embeddings,
            documents=batch_documents,
            metadatas=batch_metadatas,
        )

    print("✓ Storage completed.")