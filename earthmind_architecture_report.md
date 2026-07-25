# EarthMind AI — Full Project Architecture Report

> **Purpose**: This is a complete 0–100% technical audit of the current local codebase.
> Use it as the baseline when comparing features against the updated 160-commit GitHub repo.

---

## 1. Project Overview

**EarthMind AI** is a full-stack, multi-agent sustainability intelligence platform. A user submits a natural-language sustainability question; the system routes it through a chain of specialized AI agents (backed by a local LLM via Ollama), retrieves relevant context from a PDF knowledge base (ChromaDB), and synthesizes a structured Markdown report.

**Tagline (from code):** *"Multi-Agent Sustainability Intelligence Platform"*

---

## 2. Technology Stack (Complete)

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI 0.139 + Uvicorn 0.51 |
| LLM Orchestration | LangGraph 1.2.9 (StateGraph) |
| LLM Provider | Ollama via `langchain-ollama` (model: `llama3.2:3b`) |
| LLM Retry Logic | Tenacity (3 attempts, exponential backoff) |
| JSON Repair | `json_repair` library |
| Vector DB | ChromaDB 1.5.9 (persistent, local disk) |
| Embedding Model | `all-MiniLM-L6-v2` via `sentence-transformers` |
| PDF Parsing | `pypdf` |
| Relational DB | PostgreSQL 16 via SQLAlchemy 2.0 + `psycopg` |
| Cache | Redis 7 via `redis` client |
| Real-time | WebSocket (native FastAPI/Starlette) |
| Config | `python-dotenv` + `pydantic-settings` |
| Containerization | Docker + Docker Compose |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Router | TanStack Router (file-based routing) |
| UI Components | Radix UI primitives + shadcn/ui patterns |
| Styling | TailwindCSS 4 |
| Animations | Framer Motion 12 |
| Charts | Recharts 2 |
| PDF Export | `@react-pdf/renderer` |
| HTTP Client | Native `fetch` (custom `apiRequest` wrapper) |
| WebSocket | Custom `EarthMindWebSocket` class + `useAgentWebSocket` React hook |

---

## 3. Infrastructure (Docker Compose)

Five services are defined in [`docker-compose.yml`](file:///D:/EarthMind-AI/docker-compose.yml):

| Service | Image | Port | Purpose |
|---|---|---|---|
| `postgres` | postgres:16-alpine | 5432 | Query/report history storage |
| `redis` | redis:7-alpine | 6379 | Caching layer (initialized, not yet used for caching) |
| `ollama` | ollama/ollama:latest | 11434 | Local LLM inference engine (NVIDIA GPU-aware) |
| `backend` | Custom Dockerfile | 8000 | FastAPI app |
| `frontend` | Custom Dockerfile | 3000 | React/TanStack app |

All services have persistent named volumes. PostgreSQL and Redis have health checks. Backend `depends_on` healthy Postgres, Redis, and started Ollama.

---

## 4. Application Startup (`lifespan.py`)

On startup the backend:
1. Captures the asyncio event loop reference into `manager.loop` (enables thread-safe WebSocket broadcasting from synchronous LangGraph nodes)
2. Verifies PostgreSQL connectivity (`SELECT 1`)
3. Auto-creates all SQLAlchemy tables (`init_database()`)
4. Verifies Redis connectivity (`ping()`)
5. Verifies ChromaDB connectivity (`chroma_health_check()`)

On shutdown: disposes the SQLAlchemy connection pool and closes the Redis connection.

---

## 5. Complete REST API Reference

All routes are under `/api/v1/` prefix. The version router is in [`app/api/v1/router.py`](file:///D:/EarthMind-AI/backend/app/api/v1/router.py).

### 5.1 Query — Core AI Pipeline
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/query` | Submit a sustainability query → runs full multi-agent LangGraph pipeline → returns structured report |

**Request body:**
```json
{ "query": "string" }
```
**Response:** `QueryResponse` — includes `request_id`, `status`, `planner_output`, `report` (Markdown), per-agent `outputs`, `agent_status`, `errors`, `missing_information`, `retrieved_chunks`, `retrieved_domains`.

**Internal flow:**
1. Builds full `GraphState` (all keys initialized to avoid `KeyError`)
2. Runs `graph.invoke(initial_state)` in a worker thread via `asyncio.to_thread` (non-blocking, allows live WebSocket events)
3. Persists `QueryHistory` + `ReportHistory` to PostgreSQL (fire-and-forget, never fails the response)

---

### 5.2 Documents — Knowledge Base Management
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/documents/upload` | Upload a PDF into a knowledge domain |
| `GET` | `/api/v1/documents` | List all documents across all domains |
| `DELETE` | `/api/v1/documents?id=domain:filename` | Delete a document by composite ID |
| `GET` | `/api/v1/documents/download?id=domain:filename` | Download/preview a PDF inline |

**Upload validations:** extension (`.pdf` only), MIME type (`application/pdf`), size (≤ `MAX_UPLOAD_SIZE_MB`, default 25 MB), duplicate detection via ChromaDB.

**Valid domains:** `sdg`, `environmental`, `policy`, `finance`, `research`

---

### 5.3 History
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/history` | Paginated combined history (queries + reports) |

**Query params:** `skip`, `limit` (1–1000), `query` (filter string), `sort` (`asc`/`desc`)

---

### 5.4 Reports
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/reports` | Paginated report list with title/summary extraction |
| `GET` | `/api/v1/reports/{report_id}` | Full report detail including Markdown content, planner output, confidence, execution time |

---

### 5.5 Dashboard
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/dashboard` | Aggregated stats: queries (total/completed/failed), reports total, knowledge base breakdown, recent queries/reports/uploads |

---

### 5.6 Knowledge Base
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/knowledge-base` | ChromaDB collection stats: total documents, total chunks, per-domain breakdown, recent uploads |

---

### 5.7 Analytics
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/analytics` | Time-series data (daily/weekly/monthly): queries per period, reports per period, documents uploaded, knowledge growth; plus per-domain doc/chunk counts and per-agent execution statistics |

---

### 5.8 System Status
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/system/status` | Service connectivity (Postgres, Redis, ChromaDB, Watsonx), total document/chunk/agent counts, embedding model name |

---

### 5.9 Health
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Infrastructure liveness check — per-service `connected`/`disconnected` status |

---

### 5.10 Agents Status
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/agents/status` | Per-agent operational metrics: status, execution count, last run timestamp, average execution time |

---

### 5.11 Settings
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/settings` | Public configuration: organisation, region, notification defaults, service configuration flags |

---

### 5.12 WebSocket
| Protocol | Path | Description |
|---|---|---|
| `WS` | `/api/v1/ws` | Persistent connection for real-time agent execution events |

**Server events emitted:**
```json
{ "type": "connected", "message": "Connected to EarthMind AI" }
{ "type": "agent_started", "agent": "Planner", "timestamp": "ISO-8601" }
{ "type": "agent_completed", "agent": "Research", "timestamp": "ISO-8601" }
{ "type": "agent_failed", "agent": "Risk", "reason": "...", "timestamp": "ISO-8601" }
```

---

## 6. Multi-Agent Orchestration (LangGraph)

### 6.1 Overview

The pipeline uses a **compiled LangGraph `StateGraph`** — a DAG of agent nodes with conditional edges. It is compiled once lazily on first request (`get_graph()`) and reused for all subsequent queries.

**Entry file:** [`app/orchestrator/graph.py`](file:///D:/EarthMind-AI/backend/app/orchestrator/graph.py)

### 6.2 Shared State (`GraphState`)

Every node reads from and writes to a typed `TypedDict`:

```python
class GraphState(TypedDict):
    query: str                        # User's input question
    planner_output: dict              # Planner's structured routing result
    required_agents: List[str]        # Agent names the planner selected
    execution_order: List[str]        # Dependency-resolved execution sequence
    outputs: Dict[str, Any]           # Per-agent output dicts
    agent_status: Dict[str, str]      # success | incomplete | failed | skipped
    errors: Dict[str, str]            # Error messages for failed agents
    missing_information: List[str]    # Deduplicated gap list across all agents
    retrieved_context: List[dict]     # Raw RAG chunks (set by ResearchAgent)
```

### 6.3 Agent Dependency Graph

Dependencies are defined in [`dependencies.py`](file:///D:/EarthMind-AI/backend/app/orchestrator/dependencies.py) and resolved via DFS topological sort:

```
research  ────────────────────────────────────────────────┐
sdg       ─── [research]                                  │
policy    ─── [research]                                  ├──► report
environmental ─── [policy]                                │
finance   ─── [policy, environmental]                     │
risk      ─── [finance]                                   │
timeline  ─── [finance, risk]  ──────────────────────────┘
```

> Only the agents selected by the Planner are executed. Unselected agents are pre-marked `"skipped"`. The dependency resolver automatically adds any required parent agents (e.g. if you ask for `risk`, `finance` is added automatically).

### 6.4 Execution Flow (Step by Step)

```
START
  │
  ▼
[Planner Node]
  ├── Runs PlannerAgent (LLM with format="json" mode)
  ├── Deterministic keyword-based fallback routing (always runs)
  ├── Filters hallucinated agent names
  ├── Resolves dependency order
  └── Pre-marks unselected agents as "skipped"
  │
  ▼ (conditional edge → first agent in execution_order)
[Research Node]   ← Always first (if selected)
  ├── Domain-aware RAG retrieval from ChromaDB
  ├── Formats chunks as numbered context for LLM
  ├── LLM call → structured JSON output
  ├── Populates state["retrieved_context"]
  └── Auto-populates references from chunk metadata
  │
  ▼ (conditional → next in execution_order)
[SDG / Policy / Environmental / Finance / Risk / Timeline Nodes]
  ├── Each inherits retrieved_context from Research
  ├── Each runs its specialized LLM agent
  ├── Outputs added to state["outputs"]
  ├── Missing info merged into state["missing_information"]
  └── Status updated in state["agent_status"]
  │
  ▼ (always last)
[Report Node]
  ├── Aggregates all agent outputs
  ├── Computes overall_confidence (mean of all confidence_scores)
  ├── Determines project_status (Ready / Action Required)
  ├── Sanitizes empty/null list items
  └── Returns final Markdown report (returns_json = False)
  │
  ▼
END
```

### 6.5 Agent Registry

| Agent | Role | Returns |
|---|---|---|
| **Planner** | Routes query to correct agents; uses JSON-mode LLM | `{objective, required_agents}` |
| **Research** | RAG gateway; retrieves docs, calls LLM with context | `{findings, references, summary, ...}` |
| **SDG** | Maps query to UN Sustainable Development Goals | JSON agent output |
| **Policy** | Analyzes regulatory/government compliance angles | JSON agent output |
| **Environmental** | Carbon/emissions/ecosystem impact analysis | JSON agent output |
| **Finance** | Budget/cost/ROI/funding analysis | JSON agent output |
| **Risk** | Hazard/vulnerability/mitigation analysis | JSON agent output |
| **Timeline** | Roadmap/phase/milestone planning | JSON agent output |
| **Report** | Synthesizes all outputs into final Markdown report | Markdown string |

### 6.6 BaseAgent Architecture

All agents (except Report) inherit from [`BaseAgent`](file:///D:/EarthMind-AI/backend/app/core/base_agent.py):

- `invoke_llm(prompt)` — retried up to 3× with exponential backoff (Tenacity)
- `run(state)` — strips markdown fences → extracts JSON via regex → repairs with `json_repair` → **validates it's a `dict`** (not a list) → calculates confidence score
- On JSON failure: returns a `fallback_response()` with `status="failed"` and domain-specific `missing_information`

**Confidence scoring** (`calculate_confidence()` in `utils.py`):
- Base: 0.50
- +0.10 per finding (capped at 5 findings → +0.50 max from findings)
- +0.05 per recommendation
- +0.03 per reference
- ×0.50 penalty for empty `summary`
- +0.15 if `status="success"`, −0.05 if `status="incomplete"`
- Clamped to [0.0, 1.0]

### 6.7 WebSocket Threading Bridge (`agent_executor.py`)

Since LangGraph nodes are **synchronous** but WebSocket broadcasts are **async**, `_run_async(coro)` bridges the gap:
1. On production path: submits coroutine to the main event loop captured during lifespan startup (fire-and-forget)
2. Fallback: tries the running loop on the current thread
3. Last resort: `asyncio.run(coro)` synchronously

---

## 7. RAG System (Retrieval-Augmented Generation)

### 7.1 Document Ingestion Pipeline

```
PDF Upload → validate (ext + MIME + size) → duplicate check
  → save to disk (data/raw/{domain}/)
  → load_pdf_text() [pypdf, page-by-page]
  → chunk_records() [1000 char chunks, 150 char overlap]
  → embed_texts() [all-MiniLM-L6-v2, sentence-transformers]
  → add_chunks_to_collection() [ChromaDB]
```

**Chunk metadata stored per chunk:** `source` (filename), `page`, `domain`

### 7.2 Domain Configuration

Five ChromaDB collections (one per domain):

| Domain | Content |
|---|---|
| `research` | General sustainability research/reports |
| `sdg` | UN Sustainable Development Goals documents |
| `policy` | Government policy and regulatory documents |
| `environmental` | Climate/environmental impact reports |
| `finance` | Budget, funding, cost/ROI references |

**Config:** [`rag/config.py`](file:///D:/EarthMind-AI/backend/app/rag/config.py) — chunk size 1000, overlap 150, max distance 1.2, default top-k 5.

### 7.3 Hybrid Retrieval

[`retriever.py`](file:///D:/EarthMind-AI/backend/app/rag/retriever.py) implements hybrid search:

```
hybrid_score = (1 / (1 + semantic_distance)) + (0.2 × keyword_count)
```

- Semantic: ChromaDB cosine distance on `all-MiniLM-L6-v2` embeddings
- Keyword: word frequency count in chunk text
- Chunks with `distance > 1.2` are filtered out

### 7.4 Domain-Aware Retrieval (`domain_retriever.py`)

[`DomainRetriever`](file:///D:/EarthMind-AI/backend/app/rag/domain_retriever.py) sits above `retriever.py` and adds:

1. **Domain scoping** — only queries the ChromaDB collections matching the planner-selected agents (e.g. if `environmental` is selected, only the `environmental` collection is searched)
2. **Agent-to-collection mapping** (special cases):
   - `risk` → searches `research` + `policy` (no dedicated collection)
   - `timeline` → searches `research` + `finance` (no dedicated collection)
3. **Domain relevance boost** — 1.10× score multiplier for chunks from directly-selected domains
4. **Source diversity filter** — caps 2 chunks per source file when ≥3 sources exist
5. **Automatic fallback** — if all selected collections are empty, falls back to `retrieve_all()`

---

## 8. Data Persistence (PostgreSQL)

### 8.1 Database Models

**`query_history`** ([`models/query_history.py`](file:///D:/EarthMind-AI/backend/app/models/query_history.py)):
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique request trace ID |
| `query` | Text | Original user query |
| `execution_time` | Float | Pipeline duration in seconds |
| `planner_output` | JSON | Full planner routing result |
| `status` | String(30) | `completed` / `failed` |
| `confidence` | Float | Overall confidence score |
| `created_at` | DateTime(tz) | UTC timestamp |

**`report_history`** ([`models/report_history.py`](file:///D:/EarthMind-AI/backend/app/models/report_history.py)):
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique report ID |
| `query_id` | UUID (FK) | Links to `query_history.id` (CASCADE delete) |
| `report` | Text | Full Markdown report content |
| `created_at` | DateTime(tz) | UTC timestamp |

Relationship: `QueryHistory` → many `ReportHistory` (one query can theoretically produce multiple reports).

### 8.2 History Service

[`services/history.py`](file:///D:/EarthMind-AI/backend/app/services/history.py) provides:
- `save_query()` / `save_report()` — persistence (called fire-and-forget in query route)
- `get_combined_history()` — joined queries+reports with pagination, filtering, sorting
- `get_reports()` — paginated report list with status/query filtering
- `get_report_by_id()` — single report detail

---

## 9. WebSocket Layer

### 9.1 Server Side

**Manager** ([`websocket/manager.py`](file:///D:/EarthMind-AI/backend/app/websocket/manager.py)): `ConnectionManager` singleton that maintains a list of active `WebSocket` connections, supports `connect()`, `disconnect()`, `send_personal()`, `broadcast()`.

**Events** ([`websocket/events.py`](file:///D:/EarthMind-AI/backend/app/websocket/events.py)): Three async broadcast functions:
- `broadcast_agent_started(name)` — called by each node before running its agent
- `broadcast_agent_completed(name)` — called by each node after success
- `broadcast_agent_failed(name, reason)` — called on exception

**Route** ([`websocket/routes.py`](file:///D:/EarthMind-AI/backend/app/websocket/routes.py)): Persistent connection at `/api/v1/ws`. Sends welcome message on connect, echoes any client message (ping/pong testing).

### 9.2 Client Side

**`EarthMindWebSocket`** class ([`services/websocket.service.ts`](file:///D:/EarthMind-AI/frontend/src/services/websocket.service.ts)):
- Connects to `ws://localhost:8000/api/v1/ws`
- Auto-reconnects with exponential backoff (1s → 30s max)
- `onMessage()` / `onStateChange()` handlers with unsubscribe returns

**`useAgentWebSocket()`** React hook:
- Opens connection on mount, closes on unmount
- Derives `agentStatuses[]` (queued → running → done/error) from events
- Exposes `events[]`, `agentStatuses[]`, `isConnected`, `reset()`

---

## 10. Frontend Structure

**Framework:** React 19 + TanStack Router (file-based routing) + Vite 8

### 10.1 Pages / Routes

| Route | File | Content |
|---|---|---|
| `/` | `routes/index.tsx` | **Dashboard/Overview** — live stats, AreaChart of queries over time, recent activity |
| `/plan` | `routes/plan.tsx` | **Query submission** — main AI interface; input, domain selector, file upload, agent panel, report viewer (41KB — largest file) |
| `/documents` | `routes/documents.tsx` | PDF knowledge base management |
| `/knowledge` | `routes/knowledge.tsx` | Knowledge base stats and collection viewer |
| `/history` | `routes/history.tsx` | Query/report history browser |
| `/reports` | `routes/reports.tsx` | Report browser with Markdown viewer |
| `/analytics` | `routes/analytics.tsx` | Time-series charts and agent stats |
| `/agents` | `routes/agents.tsx` | Agent status dashboard |
| `/execution` | `routes/execution.tsx` | Real-time execution monitor |
| `/data-sources` | `routes/data-sources.tsx` | Data source management |
| `/settings` | `routes/settings.tsx` | System configuration |

### 10.2 Service Layer

All API calls go through [`services/api.ts`](file:///D:/EarthMind-AI/frontend/src/services/api.ts) (`apiRequest()` wrapper) which:
- Prepends `VITE_API_BASE_URL` (default: `http://localhost:8000`)
- Always sets `Content-Type: application/json`
- Parses response JSON and throws typed `EarthMindApiError` on non-2xx

Individual service files: `query.service.ts`, `document.service.ts`, `history.service.ts`, `report.service.ts`, `dashboard.service.ts`, `analytics.service.ts`, `agent.service.ts`, `health.service.ts`, `knowledge_base.service.ts`, `system.service.ts`, `settings.service.ts`

### 10.3 TypeScript Types

[`services/types.ts`](file:///D:/EarthMind-AI/frontend/src/services/types.ts) — 357 lines of typed interfaces mirroring every backend Pydantic schema exactly: `QueryRequest`, `QueryResponse`, `HealthResponse`, all WebSocket event types, `DashboardStatsResponse`, `KnowledgeBaseResponse`, `DocumentItem`, `AnalyticsResponse`, `SystemStatusResponse`, `AgentStatusResponse`, etc.

---

## 11. Cross-Cutting Concerns (Backend)

### 11.1 Request Logging Middleware
[`core/request_logger.py`](file:///D:/EarthMind-AI/backend/app/core/request_logger.py): Every request gets a UUID `X-Request-ID`. Logs method, path, IP, status code, response time. The same UUID is reused in the query response body for end-to-end tracing.

### 11.2 Global Exception Handlers
[`core/exception_handlers.py`](file:///D:/EarthMind-AI/backend/app/core/exception_handlers.py): Uniform `{ success, error, status }` JSON envelope for all errors. Custom types: `EarthMindException`, `DatabaseException`, `AgentException`, `ValidationException`. Catch-all handler for unhandled exceptions. No tracebacks exposed to clients.

### 11.3 CORS
[`core/cors.py`](file:///D:/EarthMind-AI/backend/app/core/cors.py): Configured from `ALLOWED_ORIGINS` env var (default: localhost:3000, 5173, 8080).

### 11.4 Prompts
One prompt file per agent in [`app/prompts/`](file:///D:/EarthMind-AI/backend/app/prompts/):
- `planner_prompt.py` — concise, example-driven (updated to fix LLM code-generation hallucinations)
- `research_prompt.py`, `environmental_prompt.py`, `policy_prompt.py`, `finance_prompt.py`, `risk_prompt.py`, `timeline_prompt.py`, `sdg_prompt.py`, `report_prompt.py`
- `json_prompt.py` — shared JSON output instructions appended to most agent prompts

---

## 12. Key Data Flows (End-to-End)

### 12.1 Document Upload Flow
```
Browser → POST /documents/upload (multipart/form-data)
  → validate → disk save (data/raw/{domain}/)
  → pypdf page extraction
  → chunking (1000 chars, 150 overlap)
  → sentence-transformers embedding (all-MiniLM-L6-v2)
  → ChromaDB storage (collection = domain)
  → UploadDocumentResponse (pages, chunks, processing_time)
```

### 12.2 Query Execution Flow
```
Browser → POST /query {query: "..."} + WS connection open
  → asyncio.to_thread(graph.invoke, state)  [non-blocking]
     │
     ├── Planner (JSON-mode Ollama LLM + deterministic fallback)
     │     └── WS: agent_started / agent_completed
     ├── Research (RAG → domain_retriever → hybrid search → LLM)
     │     └── WS: agent_started / agent_completed
     ├── [Selected agents in dependency order]
     │     └── WS events per agent
     └── Report (aggregates all → Markdown)
           └── WS: agent_started / agent_completed
  ← QueryResponse {report, outputs, agent_status, ...}
  → PostgreSQL: save QueryHistory + ReportHistory (fire-and-forget)
```

---

## 13. Known Gaps / Areas Not Yet Implemented

> [!IMPORTANT]
> These are areas present in the frontend/config but not fully wired in the backend:

| Area | Status |
|---|---|
| **Redis caching** | Redis is connected and included in health checks, but no actual caching logic is implemented anywhere in the codebase |
| **Watsonx AI integration** | Referenced in `settings.ts` types (`watsonx: boolean`) and `SystemStatusResponse` (`watsonx.configured`), but no Watsonx API calls or provider exist in the backend |
| **IBM Watson provider** | `get_llm()` only supports `"ollama"` provider; `raise ValueError` for anything else |
| **`/data-sources` route** | Frontend page exists but minimal (only 3.6KB); no dedicated backend API |
| **`/execution` route** | Frontend page exists (18KB); uses WebSocket but no dedicated execution management API |
| **Report PDF export** | `@react-pdf/renderer` is in package.json; logic exists in `frontend/src/pdf/` but export completeness is unknown |
| **Agent-specific RAG collections** | `risk` and `timeline` have no dedicated ChromaDB collections; they fall back to `research`+`policy` and `research`+`finance` respectively |
| **SDG agent RAG collection** | `sdg` collection may be empty if no SDG documents have been uploaded |
| **Settings persistence** | `GET /api/v1/settings` returns config values but no `PUT/PATCH` to update settings |
| **Authentication/Authorization** | No auth layer anywhere in the stack |
| **Rate limiting** | No rate limiting on the query endpoint |

---

## 14. File-Level Reference Map

```
EarthMind-AI/
├── backend/
│   ├── app/
│   │   ├── main.py                    FastAPI app factory + middleware registration
│   │   ├── database.py                SQLAlchemy table auto-creation
│   │   ├── agents/
│   │   │   ├── planner/agent.py       PlannerAgent + deterministic routing fallback
│   │   │   ├── research/agent.py      ResearchAgent + RAG + domain retrieval
│   │   │   ├── environmental/agent.py EnvironmentalAgent
│   │   │   ├── policy/agent.py        PolicyAgent
│   │   │   ├── finance/agent.py       FinanceAgent
│   │   │   ├── risk/agent.py          RiskAgent
│   │   │   ├── timeline/agent.py      TimelineAgent
│   │   │   ├── sdg/agent.py           SDGAgent
│   │   │   └── report/agent.py        ReportAgent (Markdown, not JSON)
│   │   ├── orchestrator/
│   │   │   ├── graph.py               LangGraph StateGraph definition (lazy compiled)
│   │   │   ├── state.py               GraphState TypedDict
│   │   │   ├── nodes.py               Node functions for each agent
│   │   │   ├── routing.py             Conditional edge functions
│   │   │   ├── dependencies.py        Agent dependency DAG + DFS resolver
│   │   │   ├── helpers.py             Pure helper functions (status, errors, missing_info)
│   │   │   └── agent_executor.py      Thread-safe async bridge for WS broadcasts
│   │   ├── api/
│   │   │   ├── v1/router.py           All route registrations
│   │   │   └── routes/
│   │   │       ├── query.py           POST /query
│   │   │       ├── documents.py       CRUD for knowledge base PDFs
│   │   │       ├── history.py         GET /history
│   │   │       ├── reports.py         GET /reports + /reports/{id}
│   │   │       ├── dashboard.py       GET /dashboard
│   │   │       ├── knowledge_base.py  GET /knowledge-base
│   │   │       ├── analytics.py       GET /analytics
│   │   │       ├── system.py          GET /system/status
│   │   │       ├── health.py          GET /health
│   │   │       ├── agents.py          GET /agents/status
│   │   │       └── settings.py        GET /settings
│   │   ├── rag/
│   │   │   ├── config.py              Domains, paths, chunk config
│   │   │   ├── ingest.py              Full ingestion pipeline
│   │   │   ├── pdf_loader.py          pypdf wrapper
│   │   │   ├── chunker.py             Text chunking with overlap
│   │   │   ├── embedder.py            SentenceTransformer wrapper (lazy cached)
│   │   │   ├── retriever.py           Hybrid search (semantic + keyword)
│   │   │   ├── domain_retriever.py    Domain-aware retrieval with boost + diversity
│   │   │   └── vector_store.py        ChromaDB client wrapper
│   │   ├── core/
│   │   │   ├── base_agent.py          BaseAgent (retry, JSON parsing, confidence)
│   │   │   ├── utils.py               calculate_confidence, fallback_response, helpers
│   │   │   ├── lifespan.py            App startup/shutdown
│   │   │   ├── exception_handlers.py  Global error handling
│   │   │   ├── exceptions.py          Custom exception types
│   │   │   ├── request_logger.py      Request ID + timing middleware
│   │   │   └── cors.py                CORS configuration
│   │   ├── models/
│   │   │   ├── query_history.py       QueryHistory SQLAlchemy model
│   │   │   └── report_history.py      ReportHistory SQLAlchemy model
│   │   ├── services/
│   │   │   ├── llm.py                 get_llm() + get_planner_llm() (JSON mode)
│   │   │   ├── history.py             History CRUD service
│   │   │   ├── documents.py           Document listing/deletion service
│   │   │   ├── analytics.py           Analytics aggregation service
│   │   │   ├── dashboard.py           Dashboard stats service
│   │   │   ├── knowledge_base.py      ChromaDB stats service
│   │   │   ├── system.py              System status service
│   │   │   ├── agents.py              Agent metrics service
│   │   │   ├── settings.py            Settings service
│   │   │   ├── postgres.py            SQLAlchemy engine + session
│   │   │   ├── redis.py               Redis client singleton
│   │   │   └── chromadb.py            ChromaDB client singleton
│   │   ├── websocket/
│   │   │   ├── manager.py             ConnectionManager singleton
│   │   │   ├── events.py              broadcast_agent_* functions
│   │   │   └── routes.py              WS endpoint /api/v1/ws
│   │   └── prompts/
│   │       ├── planner_prompt.py      Concise example-driven routing prompt
│   │       ├── research_prompt.py     RAG-aware research prompt
│   │       ├── report_prompt.py       Markdown synthesis prompt (11KB)
│   │       ├── [agent]_prompt.py      One prompt file per domain agent
│   │       └── json_prompt.py         Shared JSON output enforcement
├── frontend/
│   └── src/
│       ├── routes/                    11 page routes (TanStack file-based)
│       ├── services/                  API client + WS client + TypeScript types
│       ├── components/                Sidebar, Topbar, UI primitives
│       └── styles.css                 Global styles (TailwindCSS 4)
├── data/
│   └── raw/                           PDF knowledge base (5 domain folders)
├── docker-compose.yml                 5-service container stack
└── docs/                             Project documentation
```

---

## 15. Summary Statistics

| Metric | Value |
|---|---|
| Total REST API endpoints | **13** |
| WebSocket endpoints | **1** |
| LangGraph agent nodes | **9** (Planner, Research, SDG, Policy, Environmental, Finance, Risk, Timeline, Report) |
| ChromaDB collections | **5** |
| Frontend pages/routes | **11** |
| PostgreSQL tables | **2** (query_history, report_history) |
| Backend Python modules | ~50 files |
| Python dependencies | 126 pinned packages |
| Frontend npm dependencies | ~65 packages |

