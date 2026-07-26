"""
migrate_chroma_to_qdrant.py
----------------------------
One-time migration script: reads every document, embedding, metadata, and ID
from the existing ChromaDB PersistentClient and uploads them to Qdrant Cloud.

Run from the backend/ directory:

    python scripts/migrate_chroma_to_qdrant.py

Requirements
------------
- backend/.env must contain QDRANT_URL and QDRANT_API_KEY.
- backend/data/vector_store/ must be the existing ChromaDB directory.
- Both `chromadb` and `qdrant-client` must be installed.

Safety
------
- Uses upsert (idempotent): safe to re-run.
- Verifies point counts after each domain.
- Prints a final summary with pass/fail per domain.
"""

import os
import sys
import uuid
from pathlib import Path

# ── Make backend/ importable ────────────────────────────────────────────────
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / ".env")

import chromadb
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

# ── Config ───────────────────────────────────────────────────────────────────
VECTOR_STORE_DIR = BACKEND_DIR / "data" / "vector_store"
DOMAINS = ["sdg", "environmental", "policy", "finance", "research"]
BATCH_SIZE = 100
VECTOR_SIZE = 384  # all-MiniLM-L6-v2

# UUID namespace — must match vector_store.py so IDs are consistent
_NS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")


def _str_to_uuid(s: str) -> str:
    return str(uuid.uuid5(_NS, s))


def _ensure_qdrant_collection(client: QdrantClient, name: str) -> None:
    try:
        client.get_collection(name)
        print(f"  [Qdrant] Collection '{name}' already exists.")
    except Exception:
        client.create_collection(
            collection_name=name,
            vectors_config=qmodels.VectorParams(
                size=VECTOR_SIZE,
                distance=qmodels.Distance.COSINE,
            ),
        )
        print(f"  [Qdrant] Created collection '{name}'.")


def migrate_domain(
    chroma_client: chromadb.PersistentClient,
    qdrant_client: QdrantClient,
    domain: str,
) -> dict:
    """Migrate one domain from ChromaDB to Qdrant. Returns a result summary."""
    print(f"\n{'=' * 55}")
    print(f"  Migrating domain: {domain}")
    print(f"{'=' * 55}")

    # ── Read from ChromaDB ────────────────────────────────────────────────
    try:
        collection = chroma_client.get_collection(domain)
    except Exception as exc:
        print(f"  [ChromaDB] Collection '{domain}' not found — skipping. ({exc})")
        return {"domain": domain, "status": "skipped", "chroma_count": 0, "qdrant_count": 0}

    chroma_count = collection.count()
    print(f"  [ChromaDB] {chroma_count} points found in '{domain}'.")

    if chroma_count == 0:
        return {"domain": domain, "status": "empty", "chroma_count": 0, "qdrant_count": 0}

    # Fetch all data including embeddings
    data = collection.get(
        include=["documents", "embeddings", "metadatas"],
    )

    ids        = data["ids"]
    documents  = data["documents"]
    embeddings = data["embeddings"]
    metadatas  = data["metadatas"] or [{}] * len(ids)

    print(f"  [ChromaDB] Fetched {len(ids)} records (with embeddings).")

    # ── Prepare Qdrant collection ─────────────────────────────────────────
    _ensure_qdrant_collection(qdrant_client, domain)

    # ── Upload in batches ─────────────────────────────────────────────────
    uploaded = 0
    for i in range(0, len(ids), BATCH_SIZE):
        batch_ids   = ids[i : i + BATCH_SIZE]
        batch_docs  = documents[i : i + BATCH_SIZE]
        batch_embs  = embeddings[i : i + BATCH_SIZE]
        batch_metas = metadatas[i : i + BATCH_SIZE]

        points = []
        for str_id, doc, emb, meta in zip(batch_ids, batch_docs, batch_embs, batch_metas):
            point_id = _str_to_uuid(str_id)
            payload  = {
                "id":           str_id,
                "document":     doc,
                "source":       (meta or {}).get("source", ""),
                "filename":     (meta or {}).get("filename", (meta or {}).get("source", "")),
                "page":         (meta or {}).get("page", 0),
                "domain":       (meta or {}).get("domain", domain),
                "chunk_index":  (meta or {}).get("chunk_index", 0),
                "chunk_length": (meta or {}).get("chunk_length", len(doc) if doc else 0),
            }
            points.append(
                qmodels.PointStruct(id=point_id, vector=list(emb), payload=payload)
            )

        qdrant_client.upsert(collection_name=domain, points=points, wait=True)
        uploaded += len(points)
        print(f"  [Qdrant]  Uploaded batch {i // BATCH_SIZE + 1} — {uploaded}/{len(ids)} points.")

    # ── Verify count ──────────────────────────────────────────────────────
    qdrant_count_result = qdrant_client.count(domain, exact=True)
    qdrant_count = qdrant_count_result.count
    ok = qdrant_count >= chroma_count  # >= because Qdrant may have pre-existing points

    status = "ok" if ok else "mismatch"
    print(f"\n  ChromaDB count : {chroma_count}")
    print(f"  Qdrant count   : {qdrant_count}")
    print(f"  Status         : {'✓ OK' if ok else '✗ MISMATCH — check manually'}")

    return {
        "domain": domain,
        "status": status,
        "chroma_count": chroma_count,
        "qdrant_count": qdrant_count,
    }


def main() -> None:
    print("=" * 55)
    print("  EarthMind AI — ChromaDB → Qdrant Migration")
    print("=" * 55)

    # ── Validate environment ──────────────────────────────────────────────
    qdrant_url = os.getenv("QDRANT_URL", "")
    qdrant_key = os.getenv("QDRANT_API_KEY", "")

    if not qdrant_url:
        print("ERROR: QDRANT_URL is not set in .env. Aborting.")
        sys.exit(1)

    if not VECTOR_STORE_DIR.exists():
        print(f"ERROR: ChromaDB directory not found: {VECTOR_STORE_DIR}")
        print("Make sure you are running this from the backend/ directory")
        print("and that data/vector_store/ exists.")
        sys.exit(1)

    print(f"\nChromaDB path : {VECTOR_STORE_DIR}")
    print(f"Qdrant URL    : {qdrant_url}")
    print(f"Domains       : {', '.join(DOMAINS)}\n")

    # ── Connect ───────────────────────────────────────────────────────────
    chroma_client = chromadb.PersistentClient(path=str(VECTOR_STORE_DIR))
    qdrant_client = QdrantClient(
        url=qdrant_url,
        api_key=qdrant_key or None,
        timeout=60,
    )

    print("Connected to ChromaDB and Qdrant Cloud.")

    # ── Migrate each domain ───────────────────────────────────────────────
    results = []
    for domain in DOMAINS:
        result = migrate_domain(chroma_client, qdrant_client, domain)
        results.append(result)

    # ── Final summary ─────────────────────────────────────────────────────
    print("\n" + "=" * 55)
    print("  Migration Summary")
    print("=" * 55)
    print(f"  {'Domain':<15} {'Chroma':>8} {'Qdrant':>8}  Status")
    print(f"  {'-' * 48}")
    all_ok = True
    for r in results:
        icon = "✓" if r["status"] in ("ok", "empty", "skipped") else "✗"
        print(
            f"  {r['domain']:<15} {r['chroma_count']:>8} {r['qdrant_count']:>8}  {icon} {r['status']}"
        )
        if r["status"] not in ("ok", "empty", "skipped"):
            all_ok = False

    print()
    if all_ok:
        print("  ✓ Migration completed successfully.")
        print("  You can now remove the chromadb package from requirements.txt")
        print("  and delete backend/data/vector_store/ after confirming the app works.")
    else:
        print("  ✗ Some domains have count mismatches — review output above.")

    print("=" * 55)


if __name__ == "__main__":
    main()
