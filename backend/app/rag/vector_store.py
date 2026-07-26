"""
vector_store.py
----------------
Qdrant Cloud vector store utilities.

Each knowledge domain maps to its own Qdrant collection (e.g. "sdg",
"policy", "environmental", "finance", "research").  Collections are
created with cosine distance so the metric is consistent with
normalize_embeddings=True in the embedder.

ID strategy
-----------
Qdrant requires UUID or uint64 point IDs.  The legacy ChromaDB string IDs
(e.g. "sdg-report.pdf-p1-c0") are converted to deterministic UUID5s via
_str_to_uuid().  The original string is stored in payload["id"] so all
metadata-based filtering remains intact.

Public API is unchanged from the ChromaDB implementation:
    get_or_create_collection(domain)
    list_documents(domain)
    delete_document(domain, filename)
    is_pdf_indexed(domain, filename)
    add_chunks_to_collection(domain, chunks, embeddings)
    get_dashboard_statistics()
    get_collection_statistics()
    get_recent_uploads(limit)
    get_documents()
"""

import logging
import uuid
from datetime import datetime
from pathlib import Path

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from qdrant_client.http.exceptions import UnexpectedResponse

from app.services.qdrant import get_qdrant_client
from app.rag.config import DOMAINS, RAW_DATA_DIR

logger = logging.getLogger(__name__)

# UUID namespace — fixed so the same string always yields the same UUID
_NS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")  # NAMESPACE_URL

# Qdrant vector size for all-MiniLM-L6-v2 (384 dims)
_VECTOR_SIZE = 384
# Batch size for upserts
_BATCH_SIZE = 100


def _str_to_uuid(s: str) -> str:
    """Convert an arbitrary string to a deterministic UUID5 string."""
    return str(uuid.uuid5(_NS, s))


# ---------------------------------------------------------------------------
# QdrantDomainCollection — thin wrapper that mirrors the ChromaDB collection
# interface used by retriever.py and manage_documents.py
# ---------------------------------------------------------------------------

class QdrantDomainCollection:
    """
    Thin wrapper around a Qdrant collection that exposes the subset of the
    ChromaDB Collection API that retriever.py and manage_documents.py rely on:
        .count()
        .query(query_embeddings, n_results)   ← returns Chroma-style dict
    """

    def __init__(self, client: QdrantClient, name: str):
        self._client = client
        self.name = name

    # ------------------------------------------------------------------
    def count(self) -> int:
        """Return the number of points in this collection."""
        try:
            result = self._client.count(self.name, exact=True)
            return result.count
        except Exception:
            return 0

    # ------------------------------------------------------------------
    def query(
        self,
        query_embeddings: list[list[float]],
        n_results: int = 5,
    ) -> dict:
        """
        Semantic search — returns a ChromaDB-compatible result dict:
            {
              "documents": [[str, ...]],
              "metadatas": [[dict, ...]],
              "distances": [[float, ...]],
            }
        """
        query_vector = query_embeddings[0]

        response = self._client.query_points(
            collection_name=self.name,
            query=query_vector,
            limit=n_results,
            with_payload=True,
            score_threshold=None,
        )
        hits = response.points

        documents: list[str] = []
        metadatas: list[dict] = []
        distances: list[float] = []

        for hit in hits:
            payload = hit.payload or {}
            documents.append(payload.get("document", ""))
            metadatas.append(
                {
                    "source":       payload.get("source", ""),
                    "filename":     payload.get("filename", ""),
                    "page":         payload.get("page", 0),
                    "domain":       payload.get("domain", ""),
                    "chunk_index":  payload.get("chunk_index", 0),
                    "chunk_length": payload.get("chunk_length", 0),
                }
            )
            # Qdrant returns cosine *similarity* (1 = identical, -1 = opposite).
            # ChromaDB returns cosine *distance* (0 = identical, 2 = opposite).
            # Convert: distance = 1 - similarity
            distances.append(1.0 - hit.score)

        return {
            "documents": [documents],
            "metadatas": [metadatas],
            "distances": [distances],
        }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _ensure_collection(client: QdrantClient, domain: str) -> None:
    """Create the Qdrant collection for `domain` if it does not exist."""
    try:
        client.get_collection(domain)
    except Exception:
        client.create_collection(
            collection_name=domain,
            vectors_config=qmodels.VectorParams(
                size=_VECTOR_SIZE,
                distance=qmodels.Distance.COSINE,
            ),
        )
        logger.info("Created Qdrant collection '%s'.", domain)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_or_create_collection(domain: str) -> QdrantDomainCollection:
    """Return (or create) a QdrantDomainCollection for a domain."""
    client = get_qdrant_client()
    _ensure_collection(client, domain)
    return QdrantDomainCollection(client, domain)


def list_documents(domain: str) -> list[str]:
    """Return a sorted list of unique document filenames in a collection."""
    client = get_qdrant_client()
    _ensure_collection(client, domain)

    docs: set[str] = set()
    offset = None

    while True:
        records, next_offset = client.scroll(
            collection_name=domain,
            scroll_filter=None,
            with_payload=["filename", "source"],
            limit=256,
            offset=offset,
        )
        for record in records:
            payload = record.payload or {}
            filename = payload.get("filename") or payload.get("source")
            if filename:
                docs.add(filename)

        if next_offset is None:
            break
        offset = next_offset

    return sorted(docs)


def delete_document(domain: str, filename: str) -> None:
    """Delete all chunks belonging to one PDF and remove the physical file."""
    client = get_qdrant_client()
    _ensure_collection(client, domain)

    client.delete(
        collection_name=domain,
        points_selector=qmodels.FilterSelector(
            filter=qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="filename",
                        match=qmodels.MatchValue(value=filename),
                    )
                ]
            )
        ),
    )

    file_path = RAW_DATA_DIR / domain / filename
    if file_path.exists():
        file_path.unlink()

    logger.info("Deleted '%s' from '%s' collection and filesystem.", filename, domain)


def is_pdf_indexed(domain: str, filename: str) -> bool:
    """Check whether a PDF has already been indexed."""
    client = get_qdrant_client()
    _ensure_collection(client, domain)

    results, _ = client.scroll(
        collection_name=domain,
        scroll_filter=qmodels.Filter(
            must=[
                qmodels.FieldCondition(
                    key="filename",
                    match=qmodels.MatchValue(value=filename),
                )
            ]
        ),
        limit=1,
        with_payload=False,
    )
    return len(results) > 0


def add_chunks_to_collection(
    domain: str,
    chunks: list[dict],
    embeddings: list[list[float]],
) -> None:
    """Store document chunks in Qdrant using automatic batching."""
    if not chunks:
        return

    client = get_qdrant_client()
    _ensure_collection(client, domain)

    points: list[qmodels.PointStruct] = []

    for chunk, embedding in zip(chunks, embeddings):
        str_id = f"{domain}-{chunk['source']}-p{chunk['page']}-c{chunk['chunk_index']}"
        point_id = _str_to_uuid(str_id)

        payload = {
            "id":           str_id,          # original string ID for reference
            "source":       chunk["source"],
            "filename":     chunk["source"],
            "page":         chunk["page"],
            "domain":       domain,
            "chunk_index":  chunk["chunk_index"],
            "chunk_length": len(chunk["text"]),
            "document":     chunk["text"],   # full text stored in payload
        }

        points.append(
            qmodels.PointStruct(
                id=point_id,
                vector=embedding,
                payload=payload,
            )
        )

    total = len(points)
    num_batches = (total + _BATCH_SIZE - 1) // _BATCH_SIZE
    logger.info("Saving %d chunks in %d batch(es)...", total, num_batches)

    for i in range(0, total, _BATCH_SIZE):
        batch = points[i : i + _BATCH_SIZE]
        client.upsert(collection_name=domain, points=batch, wait=True)

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

        domains_stats.append(
            {
                "domain": domain,
                "documents": num_docs,
                "chunks": chunks,
            }
        )

    return {
        "total_documents": total_documents,
        "total_chunks": total_chunks,
        "domains": domains_stats,
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
                all_files.append(
                    {
                        "id": f"{domain}:{file_path.name}",
                        "filename": file_path.name,
                        "domain": domain,
                        "size": stat.st_size,
                        "uploaded_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    }
                )

    all_files.sort(key=lambda x: x["uploaded_at"], reverse=True)
    return all_files[:limit]


def get_documents() -> list[dict]:
    """Return all documents unified across domains with their chunk count and metadata."""
    all_docs = []
    for domain in DOMAINS:
        client = get_qdrant_client()
        _ensure_collection(client, domain)

        chunk_counts: dict[str, int] = {}
        offset = None

        while True:
            records, next_offset = client.scroll(
                collection_name=domain,
                scroll_filter=None,
                with_payload=["filename", "source"],
                limit=256,
                offset=offset,
            )
            for record in records:
                payload = record.payload or {}
                filename = payload.get("filename") or payload.get("source")
                if filename:
                    chunk_counts[filename] = chunk_counts.get(filename, 0) + 1

            if next_offset is None:
                break
            offset = next_offset

        domain_dir = RAW_DATA_DIR / domain
        for filename, count in chunk_counts.items():
            file_path = domain_dir / filename
            size = file_path.stat().st_size if file_path.exists() else 0
            uploaded_at = (
                datetime.fromtimestamp(file_path.stat().st_mtime).isoformat()
                if file_path.exists()
                else None
            )

            all_docs.append(
                {
                    "id": f"{domain}:{filename}",
                    "filename": filename,
                    "domain": domain,
                    "chunks": count,
                    "size": size,
                    "uploaded_at": uploaded_at,
                }
            )

    return all_docs