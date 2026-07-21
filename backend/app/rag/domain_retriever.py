"""
rag/domain_retriever.py
-----------------------
Domain-aware retrieval wrapper for the EarthMind multi-agent pipeline.

This module sits on top of the existing retriever.py and adds:

1. Domain-scoped retrieval  — query only the ChromaDB collections that
   correspond to the planner-selected agents, not every domain.

2. Source diversity filter  — prevent one PDF from dominating the results
   by capping the number of chunks returned per unique source file.

3. Domain relevance boost   — chunks from domains that exactly match the
   planner-selected agents receive a small multiplicative score boost
   before the final global ranking.

4. Automatic fallback       — if the domain-scoped search yields zero
   chunks (e.g. all relevant collections are empty), the function falls
   back to retrieve_all() so the pipeline always has some context.

Design note
-----------
retriever.py is NOT modified.  This module only calls the existing
retrieve(domain, query) and retrieve_all(query) functions.
"""

import logging
from typing import List

from .config import DOMAINS, DEFAULT_TOP_K
from .retriever import retrieve, retrieve_all

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Agent name → ChromaDB collection name mapping
# Risk and Timeline have no dedicated collection; they fall back to the
# closest domain (research + policy for risk, research + finance for timeline).
# ---------------------------------------------------------------------------
AGENT_TO_DOMAINS: dict[str, List[str]] = {
    "research":      ["research"],
    "sdg":           ["sdg"],
    "policy":        ["policy"],
    "environmental": ["environmental"],
    "finance":       ["finance"],
    # No dedicated collections for risk/timeline — use related domains
    "risk":          ["research", "policy"],
    "timeline":      ["research", "finance"],
}

# Maximum chunks returned per unique source file when there are 3+ sources.
_MAX_CHUNKS_PER_SOURCE = 2

# Score multiplier for chunks from directly-selected agent domains.
_DOMAIN_RELEVANCE_BOOST = 1.10


def _agent_names_to_domains(agent_names: List[str]) -> List[str]:
    """
    Map a list of planner-selected agent names to ChromaDB domain names.

    Returns a deduplicated list of valid domain names.
    Unmapped agents are silently skipped (they have no collection).
    """
    seen: set[str] = set()
    result: List[str] = []
    for agent in agent_names:
        for domain in AGENT_TO_DOMAINS.get(agent, []):
            if domain in DOMAINS and domain not in seen:
                seen.add(domain)
                result.append(domain)
    return result


def _apply_source_diversity(
    chunks: List[dict],
    max_per_source: int = _MAX_CHUNKS_PER_SOURCE,
) -> List[dict]:
    """
    Cap the number of chunks per unique source file.

    If fewer than 3 unique sources are present, the cap is not applied
    (no point penalising when there is limited source diversity).

    Chunks are assumed to be pre-sorted by hybrid_score descending.
    We iterate in order and skip once a source has hit its cap.
    """
    unique_sources = {c.get("source") for c in chunks if c.get("source")}
    if len(unique_sources) < 3:
        return chunks  # Not enough diversity to apply cap

    source_count: dict[str, int] = {}
    filtered: List[dict] = []
    remainder: List[dict] = []

    for chunk in chunks:
        source = chunk.get("source") or "unknown"
        count = source_count.get(source, 0)
        if count < max_per_source:
            source_count[source] = count + 1
            filtered.append(chunk)
        else:
            remainder.append(chunk)

    # Append remainder so we never drop results entirely
    return filtered + remainder


def _apply_domain_boost(
    chunks: List[dict],
    selected_domains: List[str],
    boost: float = _DOMAIN_RELEVANCE_BOOST,
) -> List[dict]:
    """
    Multiply hybrid_score by `boost` for chunks whose domain matches
    a directly-selected agent domain.
    """
    selected_set = set(selected_domains)
    for chunk in chunks:
        if chunk.get("domain") in selected_set:
            chunk["hybrid_score"] = chunk.get("hybrid_score", 0.0) * boost
    return chunks


def retrieve_domains(
    agent_names: List[str],
    query: str,
    top_k: int = DEFAULT_TOP_K,
) -> List[dict]:
    """
    Retrieve chunks from the ChromaDB collections that correspond to
    the planner-selected agents.

    Parameters
    ----------
    agent_names : planner-selected agent names (e.g. ["research", "policy"])
    query       : the user's natural-language query
    top_k       : maximum number of chunks to return

    Returns
    -------
    Ranked list of chunk dicts, each containing:
        text, source, page, domain, distance, keyword_score, hybrid_score
    """
    query = query.strip().lower()
    domains = _agent_names_to_domains(agent_names)

    logger.info(
        "[RAG] Planner selected: %s",
        ", ".join(agent_names) if agent_names else "(none)",
    )
    logger.info(
        "[RAG] Searching collections: %s",
        ", ".join(domains) if domains else "(none — fallback to all)",
    )

    # ── Query each selected domain ────────────────────────────────────────────
    all_chunks: List[dict] = []
    for domain in domains:
        chunks = retrieve(domain, query, top_k)
        # Ensure domain tag is set
        for c in chunks:
            if c.get("domain") is None:
                c["domain"] = domain
        all_chunks.extend(chunks)

    # ── Fallback if every selected collection was empty ───────────────────────
    if not all_chunks:
        logger.warning(
            "[RAG] All selected collections empty. Falling back to retrieve_all()."
        )
        all_chunks = retrieve_all(query, top_k)

    # ── Apply domain relevance boost ──────────────────────────────────────────
    all_chunks = _apply_domain_boost(all_chunks, domains)

    # ── Global re-rank by boosted hybrid_score ────────────────────────────────
    all_chunks.sort(key=lambda x: x.get("hybrid_score", 0.0), reverse=True)

    # ── Source diversity filter ───────────────────────────────────────────────
    all_chunks = _apply_source_diversity(all_chunks)

    # ── Final top-k cut ───────────────────────────────────────────────────────
    result = all_chunks[:top_k]

    # Log retrieval summary
    sources = sorted({c.get("source") or "unknown" for c in result})
    logger.info(
        "[RAG] Retrieved %d chunks | Sources: %s",
        len(result),
        ", ".join(sources) if sources else "(none)",
    )

    return result
