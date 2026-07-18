"""
chunker.py
----------
Step 2 of the pipeline: split page text into smaller overlapping
"chunks".

Why chunk at all?
- Embedding models and LLMs work best on small, focused pieces of text,
  not entire documents.
- Smaller chunks -> more precise search results (you retrieve the exact
  paragraph that answers the question, not a whole 20-page report).

Why overlap?
- If we cut chunks with hard, non-overlapping boundaries, a sentence
  that answers the question might get split in half between two
  chunks, and neither half is useful on its own. A small overlap
  (150 characters here) keeps context continuous across the cut.
"""

from .config import CHUNK_SIZE, CHUNK_OVERLAP


from .config import CHUNK_SIZE, CHUNK_OVERLAP


def chunk_text(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> list[str]:
    """
    Split text into semantically cleaner chunks.

    Strategy:
    - Prefer paragraph boundaries.
    - Merge very small chunks.
    - Split oversized paragraphs with overlap.
    """

    text = text.strip()
    if not text:
        return []

    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    chunks = []
    current_chunk = ""

    for paragraph in paragraphs:
        if len(current_chunk) + len(paragraph) + 2 <= chunk_size:
            current_chunk += ("\n\n" if current_chunk else "") + paragraph
        else:
            if current_chunk:
                chunks.append(current_chunk)

            if len(paragraph) <= chunk_size:
                current_chunk = paragraph
            else:
                start = 0
                step = chunk_size - overlap

                while start < len(paragraph):
                    piece = paragraph[start:start + chunk_size].strip()
                    if piece:
                        chunks.append(piece)
                    start += step

                current_chunk = ""

    if current_chunk:
        chunks.append(current_chunk)

    # Merge tiny trailing chunks
    merged = []
    for chunk in chunks:
        if merged and len(chunk) < 100:
            merged[-1] += "\n\n" + chunk
        else:
            merged.append(chunk)

    return merged


def chunk_records(page_records: list[dict]) -> list[dict]:
    """
    Take the page-level records from pdf_loader.py and turn them into
    chunk-level records, ready for embedding.

    Input:  [{"source": "x.pdf", "page": 1, "text": "long text..."}, ...]
    Output: [{"source": "x.pdf", "page": 1, "chunk_index": 0, "text": "..."}, ...]
    """
    chunked = []
    for record in page_records:
        pieces = chunk_text(record["text"])
        for idx, piece in enumerate(pieces):
            chunked.append({
                "source": record["source"],
                "page": record["page"],
                "chunk_index": idx,
                "text": piece,
            })
    return chunked
