"""
embedder.py
-----------
Step 3 of the pipeline: turn text chunks into "embeddings" (a list of
numbers, e.g. 384 numbers per chunk) that represent the *meaning* of
the text.

Why do we need this?
- Computers can't search by "meaning" directly. But if we convert text
  into vectors of numbers such that similar meanings end up as similar
  numbers, we CAN search by meaning - by finding the closest vectors.
  That's the whole idea behind "semantic search".

We use a local, free, open-source model (all-MiniLM-L6-v2) via the
`sentence-transformers` library. The first time you run this, it will
download the model (~90MB) automatically and cache it. After that it
runs fully offline, no API key needed, no per-call cost.
"""

from sentence_transformers import SentenceTransformer
from .config import EMBEDDING_MODEL_NAME

_model = None  # loaded lazily so importing this file is instant


def get_embedding_model() -> SentenceTransformer:
    """Load the embedding model once, then reuse it (loading is slow)."""
    global _model
    if _model is None:
        print(f"Loading embedding model '{EMBEDDING_MODEL_NAME}' "
              f"(first run downloads it, later runs use the cache)...")
        _model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Convert a list of text strings into a list of embedding vectors.
    Batches internally, so it's fine to pass hundreds of chunks at once.
    """
    model = get_embedding_model()
    embeddings = model.encode(
        texts,
        show_progress_bar=True,
        convert_to_numpy=True,
    )
    return embeddings.tolist()
