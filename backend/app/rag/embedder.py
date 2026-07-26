"""
embedder.py
-----------
Converts text chunks into embedding vectors for semantic search.

Provider: Hugging Face Inference API
Model:    sentence-transformers/all-MiniLM-L6-v2  (384-dim, cosine-normalized)

This model is numerically identical to the previous SentenceTransformer
local model, so existing Qdrant vectors remain valid — no re-ingestion
is required after switching from the local model to this API embedder.

Interface
---------
The public interface is unchanged:

    embed_texts(texts: list[str], show_progress: bool | None = None)
        -> list[list[float]]

To swap embedding providers in the future, edit only this file.
The rest of the project (vector_store.py, retriever.py, ingest.py,
domain_retriever.py) is provider-agnostic.

Configuration
-------------
Set HF_API_TOKEN in your .env file.  The token is read from settings at
call time so the module can be imported without a valid token present.

Batching
--------
The HF Inference API accepts up to 2048 tokens per request and recommends
batches ≤ 64 sentences.  embed_texts() splits larger lists automatically.
"""

import logging
import math
import time
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

# HF Inference API endpoint for the embedding model
_HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
_HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{_HF_MODEL}/pipeline/feature-extraction"

# Maximum sentences per API call
_API_BATCH_SIZE = 64

# Retry settings
_MAX_RETRIES = 3
_RETRY_DELAY = 2.0  # seconds


def _get_token() -> str:
    """Read HF_API_TOKEN from settings at call time."""
    from app.config.settings import settings
    token = settings.HF_API_TOKEN
    if not token:
        raise RuntimeError(
            "HF_API_TOKEN is not set. "
            "Add it to your .env file: HF_API_TOKEN=hf_..."
        )
    return token


def _call_hf_api(texts: list[str], token: str) -> list[list[float]]:
    """
    Call the HF Inference API for one batch of texts.
    Returns a list of embedding vectors (list[float]).

    Retries on 503 (model loading) with exponential back-off.
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    payload = {
        "inputs": texts
    }

    for attempt in range(1, _MAX_RETRIES + 1):
        try:
            response = httpx.post(
                _HF_API_URL,
                headers=headers,
                json=payload,
                timeout=180.0,
            )
            if response.status_code != 200:
                print(f"Status Code: {response.status_code}")
                print(f"Response Text: {response.text}")
            response.raise_for_status()
            result = response.json()

            if isinstance(result, dict) and "error" in result:
                raise RuntimeError(f"HF API Error: {result['error']}")

            # HF feature-extraction returns list[list[float]] (one vector per input)
            if isinstance(result, list) and len(result) > 0:
                # Some models nest an extra dimension — flatten if needed
                if isinstance(result[0], list) and isinstance(result[0][0], list):
                    # Shape: [batch, 1, dim] → [batch, dim] (mean pool)
                    result = [
                        [sum(col) / len(col) for col in zip(*row)]
                        for row in result
                    ]
                
                # Normalize vectors to unit length
                normalized = []
                for vec in result:
                    norm = math.sqrt(sum(x * x for x in vec))
                    if norm > 0:
                        normalized.append([x / norm for x in vec])
                    else:
                        normalized.append(vec)
                return normalized

            raise ValueError(f"Unexpected HF API response shape: {type(result)}")

        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 503 and attempt < _MAX_RETRIES:
                wait = _RETRY_DELAY * attempt
                logger.warning(
                    "HF API returned 503 (model loading). "
                    "Retrying in %.1fs (attempt %d/%d)...",
                    wait, attempt, _MAX_RETRIES,
                )
                time.sleep(wait)
            else:
                raise

    raise RuntimeError("HF API failed after maximum retries.")


def embed_texts(
    texts: list[str],
    show_progress: Optional[bool] = None,
) -> list[list[float]]:
    """
    Convert a list of text strings into embedding vectors.

    Parameters
    ----------
    texts:
        The text strings to embed.
    show_progress:
        If None (default), a progress indicator is shown only when embedding
        more than one text (batch ingestion).  Pass True/False to override.

    Returns
    -------
    list[list[float]]
        One 384-dimensional normalized embedding per input text.
    """
    if not texts:
        return []

    token = _get_token()

    show = show_progress if show_progress is not None else len(texts) > 1

    all_embeddings: list[list[float]] = []
    total_batches = (len(texts) + _API_BATCH_SIZE - 1) // _API_BATCH_SIZE

    for i in range(0, len(texts), _API_BATCH_SIZE):
        batch = texts[i : i + _API_BATCH_SIZE]
        batch_num = i // _API_BATCH_SIZE + 1

        if show:
            logger.info(
                "Embedding batch %d/%d (%d texts)...",
                batch_num, total_batches, len(batch),
            )

        embeddings = _call_hf_api(batch, token)
        all_embeddings.extend(embeddings)

    return all_embeddings