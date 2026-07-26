"""
config.py
---------
All the "settings" for the ingestion pipeline live here, in one place.
If you ever want to change chunk size, the embedding model, or add a
new domain, this is the only file you should need to touch.
"""

from pathlib import Path

# -----------------------------------------------------------------
# PATHS
# -----------------------------------------------------------------
# BASE_DIR = .../backend
BASE_DIR = Path(__file__).resolve().parents[2]

# Where your raw PDF/text files live, one sub-folder per domain
RAW_DATA_DIR = BASE_DIR.parent / "data" / "raw"

# Where ChromaDB (legacy) stored its database files — kept for the
# one-time migration script (migrate_chroma_to_qdrant.py).
VECTOR_STORE_DIR = BASE_DIR / "data" / "vector_store"

# -----------------------------------------------------------------
# DOMAINS
# -----------------------------------------------------------------
# These map 1:1 to the folders in data/raw/ AND to Qdrant collection names
# AND to the agents that will query them.
DOMAINS = [
    "sdg",           # UN Sustainable Development Goals documents
    "environmental",  # climate/environmental reports
    "policy",        # government policy documents
    "finance",       # funding, budgets, cost/ROI references
    "research",      # general background research/reports
]

# -----------------------------------------------------------------
# CHUNKING
# -----------------------------------------------------------------
# We can't feed a whole 100-page PDF to the embedding model or the LLM
# at once, so we cut it into smaller overlapping "chunks".
CHUNK_SIZE = 1000      # characters per chunk (~150-200 words)
CHUNK_OVERLAP = 150    # characters shared between consecutive chunks,
                        # so we don't lose context at the cut point
# Maximum semantic distance allowed for retrieval
MAX_DISTANCE = 1.2
# -----------------------------------------------------------------
# EMBEDDING MODEL
# -----------------------------------------------------------------
# This is a free, local, open-source model (downloads once, then runs
# on your machine, no API key, no cost). It turns text into a list of
# numbers ("a vector") that captures its meaning.
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

# -----------------------------------------------------------------
# RETRIEVAL
# -----------------------------------------------------------------
DEFAULT_TOP_K = 5  # how many chunks to return per search, by default
