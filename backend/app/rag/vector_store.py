"""
vector_store.py
----------------
ChromaDB vector store utilities.

Each knowledge domain gets its own collection.
Large insertions are automatically split into batches.

Uses the shared ``get_chroma_client()`` singleton from
``app.services.chromadb`` instead of opening a new connection per call.
"""

from chromadb.utils.batch_utils import create_batches

from app.services.chromadb import get_chroma_client


def get_or_create_collection(domain: str):
    """Return (or create) a collection for a domain."""
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=domain,
        metadata={"domain": domain},
    )


def list_documents(domain: str) -> list[str]:
    """Return a sorted list of unique document filenames in a collection."""
    collection = get_or_create_collection(domain)
    data = collection.get(include=["metadatas"])
    docs = set()
    for metadata in data["metadatas"]:
        if not metadata:
            continue
        filename = metadata.get("filename") or metadata.get("source")
        if filename:
            docs.add(filename)
    return sorted(docs)


def delete_document(domain: str, filename: str) -> None:
    """Delete all chunks belonging to one PDF."""
    collection = get_or_create_collection(domain)
    collection.delete(where={"filename": filename})
    print(f"Deleted '{filename}' from '{domain}' collection.")


def is_pdf_indexed(domain: str, filename: str) -> bool:
    """Check whether a PDF has already been indexed."""
    collection = get_or_create_collection(domain)
    results = collection.get(where={"filename": filename}, limit=1)
    return len(results["ids"]) > 0


def add_chunks_to_collection(
    domain: str,
    chunks: list[dict],
    embeddings: list[list[float]],
) -> None:
    """Store document chunks in ChromaDB using automatic batching."""
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
            "source":       chunk["source"],
            "filename":     chunk["source"],
            "page":         chunk["page"],
            "domain":       domain,
            "chunk_index":  chunk["chunk_index"],
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


def get_dashboard_statistics() -> dict:
    """Return aggregated statistics for the dashboard."""
    from app.rag.config import DOMAINS
    
    total_chunks = 0
    total_documents = 0
    domains_stats = []
    
    for domain in DOMAINS:
        collection = get_or_create_collection(domain)
        chunks = collection.count()
        docs = list_documents(domain)
        num_docs = len(docs)
        
        total_chunks += chunks
        total_documents += num_docs
        
        domains_stats.append({
            "domain": domain,
            "documents": num_docs,
            "chunks": chunks
        })
        
    return {
        "total_documents": total_documents,
        "total_chunks": total_chunks,
        "domains": domains_stats
    }