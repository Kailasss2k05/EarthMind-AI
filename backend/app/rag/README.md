# Member C — Knowledge & Data Layer: Step-by-Step

This walks through today's task with zero assumed knowledge. Follow it
top to bottom in order.

## 0. What you're building, in one sentence
A pipeline that takes PDF documents, breaks them into small pieces,
converts each piece into a searchable "fingerprint" (embedding), and
stores everything in ChromaDB so an AI agent can later ask "find me the
paragraphs about SDG 7" and get the right text back instantly.

## 1. Set up your Python environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate
pip install -r requirements-rag.txt
```
This creates an isolated Python environment (`venv`) just for this
project, and installs 4 libraries: chromadb, pypdf, sentence-transformers, tqdm.

## 2. Collect your documents (today's data collection task)
Each folder in `data/raw/<domain>/` has its own README.md with links to
real SDG and government policy sources. Open each one and download 2-3
PDFs per domain:
- `data/raw/sdg/`
- `data/raw/environmental/`
- `data/raw/policy/`
- `data/raw/finance/`
- `data/raw/research/`

Just save the PDF files directly into these folders. No renaming needed.

## 3. Run the ingestion pipeline
```bash
python -m app.rag.ingest
```
Watch the terminal — for each domain it will print which PDFs it read,
how many chunks it created, and confirm it stored them. First run will
be slower because it downloads the embedding model (~90MB) once.

## 4. Test that semantic search actually works
```bash
python -m app.rag.test_retrieval
```
Type a domain (e.g. `sdg`) then a question (e.g. `What is SDG 7 about?`).
You should get back the most relevant chunks, with their source PDF and
page number. If you see real, relevant text - it's working.

## 5. What "Agentic RAG foundation" means (already done for you)
Open `retriever.py`. It has one function, `retrieve(domain, query)`.
That's the whole contract other agents need — later, the SDG Agent,
Policy Agent, Finance Agent etc. will each just call:
```python
from app.rag.retriever import retrieve
results = retrieve(domain="sdg", query=agent_sub_query)
```
You don't need to build anything more for that today — this function
already is the foundation. You're done once step 4 gives you sensible
answers for at least a couple of your 5 domains.

## Troubleshooting
- **"No PDFs found"**: you haven't saved any files into that domain's folder yet — see step 2.
- **Slow / stuck downloading**: the embedding model download needs a real internet connection (not a sandbox) — let it finish once, it's cached after that.
- **`ModuleNotFoundError`**: make sure you activated venv (step 1) and are running commands from inside `backend/`.
