"""
vector_store.py
----------------
ChromaDB vector store utilities.

Each knowledge domain gets its own collection.
Large insertions are automatically split into batches.

Uses the shared ``get_chroma_client()`` singleton from
``app.services.chromadb`` instead of opening a new connection per call.

ChromaDB metric (M-3): Collections are created with hnsw:space=cosine so
the distance metric is explicit and consistent with normalize_embeddings=True
in the embedder. MAX_DISTANCE in config.py is tuned for cosine distance (0-2).
"""

import logging
from chromadb.utils.batch_utils import create_batches
from pathlib import Path
from datetime import datetime

from app.services.chromadb import get_chroma_client
from app.rag.config import DOMAINS, RAW_DATA_DIR

logger = logging.getLogger(__name__)


def get_or_create_collection(domain: str):
    """Return (or create) a collection for a domain.

    The hnsw:space=cosine metadata ensures ChromaDB uses cosine distance
    regardless of the default version behaviour (M-3).
    """
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=domain,
        metadata={"domain": domain, "hnsw:space": "cosine"},
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
    """Delete all chunks belonging to one PDF and remove the physical file."""
    collection = get_or_create_collection(domain)
    collection.delete(where={"filename": filename})

    file_path = RAW_DATA_DIR / domain / filename
    if file_path.exists():
        file_path.unlink()

    logger.info("Deleted '%s' from '%s' collection and filesystem.", filename, domain)


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

    logger.info("Saving %d chunks in %d batch(es)...", len(ids), len(batches))
    for batch in batches:
        batch_ids, batch_embeddings, batch_metadatas, batch_documents = batch
        collection.upsert(
            ids=batch_ids,
            embeddings=batch_embeddings,
            documents=batch_documents,
            metadatas=batch_metadatas,
        )
    logger.info("Storage completed for domain '%s'.", domain)


def get_dashboard_statistics() -> dict:
    """Return aggregated statistics for the dashboard."""

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


def get_collection_statistics() -> list[dict]:
    """Return statistics for each collection."""
    return get_dashboard_statistics()["domains"]


def get_recent_uploads(limit: int = 10) -> list[dict]:
    """Return the most recently uploaded documents across all domains."""
    all_files = []
    for domain in DOMAINS:
        domain_dir = RAW_DATA_DIR / domain
        if domain_dir.exists():
            for file_path in domain_dir.glob("*.pdf"):
                stat = file_path.stat()
                all_files.append({
                    "id": f"{domain}:{file_path.name}",
                    "filename": file_path.name,
                    "domain": domain,
                    "size": stat.st_size,
                    "uploaded_at": datetime.fromtimestamp(stat.st_mtime).isoformat()
                })

    # Sort by uploaded_at descending
    all_files.sort(key=lambda x: x["uploaded_at"], reverse=True)
    return all_files[:limit]


def get_documents() -> list[dict]:
    """Return all documents unified across domains with their chunk count and metadata."""
    all_docs = []
    for domain in DOMAINS:
        collection = get_or_create_collection(domain)
        data = collection.get(include=["metadatas"])

        chunk_counts: dict[str, int] = {}
        for meta in data["metadatas"]:
            if not meta:
                continue
            filename = meta.get("filename") or meta.get("source")
            if filename:
                chunk_counts[filename] = chunk_counts.get(filename, 0) + 1

        domain_dir = RAW_DATA_DIR / domain
        for filename, count in chunk_counts.items():
            file_path = domain_dir / filename
            size = file_path.stat().st_size if file_path.exists() else 0
            uploaded_at = datetime.fromtimestamp(file_path.stat().st_mtime).isoformat() if file_path.exists() else None

            all_docs.append({
                "id": f"{domain}:{filename}",
                "filename": filename,
                "domain": domain,
                "chunks": count,
                "size": size,
                "uploaded_at": uploaded_at
            })

    return all_docs