"""
embedder.py
-----------
Converts text chunks into embeddings for semantic search.

Thread-safety (H-5): The _model singleton is guarded by a threading.Lock
so concurrent requests cannot double-load the model.

Progress bar (L-8): show_progress_bar is only enabled for batch ingestion
(multiple texts), not for single-query embedding at inference time.
"""

import threading
from sentence_transformers import SentenceTransformer
from .config import EMBEDDING_MODEL_NAME

_model: SentenceTransformer | None = None
_model_lock = threading.Lock()


def get_embedding_model() -> SentenceTransformer:
    """
    Load the embedding model once and reuse it.
    Thread-safe: only one thread initialises the model;
    all others block until it is ready.
    """
    global _model

    if _model is None:
        with _model_lock:
            # Double-checked locking: re-test after acquiring the lock
            if _model is None:
                print(
                    f"Loading embedding model '{EMBEDDING_MODEL_NAME}' "
                    "(first run downloads it, later runs use the cache)..."
                )
                _model = SentenceTransformer(EMBEDDING_MODEL_NAME)

    return _model


def embed_texts(texts: list[str], show_progress: bool | None = None) -> list[list[float]]:
    """
    Convert a list of text strings into embedding vectors.

    Parameters
    ----------
    texts:
        The text strings to embed.
    show_progress:
        If None (default), the progress bar is shown only when embedding
        more than one text (batch ingestion). Pass True/False to override.
    """
    model = get_embedding_model()

    # Only show the progress bar during batch ingestion (not per-query inference)
    if show_progress is None:
        show_progress = len(texts) > 1

    embeddings = model.encode(
        texts,
        batch_size=64,
        show_progress_bar=show_progress,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )

    return embeddings.tolist()