"""
vector_store.py
----------------
Step 4 of the pipeline: ChromaDB setup.

ChromaDB is the vector database: it stores each chunk's text + its
embedding + metadata (source file, page, domain), and lets us search
"which chunks are closest in meaning to this query?" very fast.

Design note (matches SRS Section 3.4):
"Each agent that requires grounded evidence queries its own
domain-filtered collection in ChromaDB rather than a single shared
index."
-> So instead of ONE big collection, we create one Chroma *collection*
per domain (sdg, environmental, policy, finance, research). This keeps
the SDG agent from accidentally retrieving a finance document, etc.
"""

import chromadb
from .config import VECTOR_STORE_DIR


def get_chroma_client() -> chromadb.ClientAPI:
    """
    A PersistentClient saves the database to disk at VECTOR_STORE_DIR,
    so the data is still there next time you run the program (unlike
    an in-memory client, which forgets everything when the script ends).
    """
    VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=str(VECTOR_STORE_DIR))


def get_or_create_collection(domain: str):
    """
    Each domain gets its own named collection, e.g. 'sdg', 'policy'.
    get_or_create means: safe to call this every time you run the
    script, it won't error out if the collection already exists.
    """
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=domain,
        metadata={"domain": domain},
    )


def add_chunks_to_collection(domain: str, chunks: list[dict], embeddings: list[list[float]]):
    """
    Store chunks + their embeddings + metadata in the domain's collection.

    chunks: list of {"source", "page", "chunk_index", "text"}
    embeddings: list of vectors, same length/order as chunks
    """
    if not chunks:
        return

    collection = get_or_create_collection(domain)

    ids = [f"{domain}-{c['source']}-p{c['page']}-c{c['chunk_index']}" for c in chunks]
    documents = [c["text"] for c in chunks]
    metadatas = [
        {"source": c["source"], "page": c["page"], "domain": domain}
        for c in chunks
    ]

    # upsert = "insert or update": re-running ingestion on the same
    # files won't create duplicate entries.
    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas,
    )
