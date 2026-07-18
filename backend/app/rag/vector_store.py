"""
vector_store.py
----------------
Step 4 of the pipeline: ChromaDB setup.
"""

import chromadb
from .config import VECTOR_STORE_DIR


def get_chroma_client() -> chromadb.ClientAPI:
    """
    Create or open the persistent ChromaDB database.
    """
    VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=str(VECTOR_STORE_DIR))


def get_or_create_collection(domain: str):
    """
    Return the ChromaDB collection for the given domain.
    """
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=domain,
        metadata={"domain": domain},
    )


def add_chunks_to_collection(domain: str, chunks: list[dict], embeddings: list[list[float]]):
    """
    Store chunks, embeddings, and metadata in ChromaDB.
    """
    if not chunks:
        return

    collection = get_or_create_collection(domain)

    ids = [
        f"{domain}-{c['source']}-p{c['page']}-c{c['chunk_index']}"
        for c in chunks
    ]

    documents = [c["text"] for c in chunks]

    metadatas = []

    for c in chunks:
        metadatas.append(
            {
                "source": c["source"],
                "filename": c["source"],
                "page": c["page"],
                "domain": domain,
                "chunk_index": c["chunk_index"],
                "chunk_length": len(c["text"]),
            }
        )

    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas,
    )