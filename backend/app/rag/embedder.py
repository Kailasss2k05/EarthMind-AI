"""
embedder.py
-----------
Converts text chunks into embeddings for semantic search.
"""

from sentence_transformers import SentenceTransformer
from .config import EMBEDDING_MODEL_NAME

_model = None


def get_embedding_model() -> SentenceTransformer:
    """
    Load the embedding model once and reuse it.
    """
    global _model

    if _model is None:
        print(
            f"Loading embedding model '{EMBEDDING_MODEL_NAME}' "
            "(first run downloads it, later runs use the cache)..."
        )
        _model = SentenceTransformer(EMBEDDING_MODEL_NAME)

    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Convert a list of text strings into embedding vectors.
    Uses batching for faster processing during ingestion.
    """
    model = get_embedding_model()

    embeddings = model.encode(
        texts,
        batch_size=64,
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )

    return embeddings.tolist()