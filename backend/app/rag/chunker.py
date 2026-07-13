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


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """
    Split a single string of text into overlapping chunks.

    Example with chunk_size=10, overlap=3 on "ABCDEFGHIJKLMNOP":
        chunk 1: "ABCDEFGHIJ"
        chunk 2: "HIJKLMNOPQ"   (starts 3 chars before chunk 1 ended)
        ...
    """
    text = text.strip()
    if not text:
        return []

    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    step = chunk_size - overlap

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += step

    return chunks


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
