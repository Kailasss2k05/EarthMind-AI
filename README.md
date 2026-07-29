<div align="center">

# 🌍 EarthMind AI

### ⚡ A full-stack, multi-agent sustainability intelligence platform powered by LangGraph, Agentic RAG, and real-time WebSocket streaming

<img src="https://skillicons.dev/icons?i=python,fastapi,react,postgres,redis,docker" />

<br/>

![FastAPI](https://img.shields.io/badge/FastAPI-0.139-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)
![LangGraph](https://img.shields.io/badge/LangGraph-1.2.9-6C3483?logo=langchain&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-1.5.9-FF6B35?logo=databricks&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLM-F26822?logo=groq&logoColor=white)

</div>

---

## 📑 Table of Contents

1. 📌 Overview
2. 🏗️ System Architecture
3. 🧩 Components
4. 🤖 Multi-Agent Pipeline
5. ✨ Key Features
6. 🧰 Tech Stack
7. 📚 RAG System
8. 🛠️ Built-in Tools
9. 🔗 API Reference
10. 📡 WebSocket Events
11. 📁 Project Structure
12. 🚀 Getting Started
13. ⚙️ Environment Variables
14. 🧪 Troubleshooting & Notes

---

## 📌 Overview

**EarthMind AI** is a full-stack, multi-agent sustainability intelligence platform built as part of the **IBM SkillsBuild AI Automation & Intelligent Solutions Internship**. Users submit a natural-language sustainability query; the system routes it through a chain of **9 specialized AI agents** backed by a Groq-powered LLM, retrieves relevant context from a **PDF knowledge base** (ChromaDB / Qdrant), executes domain-specific analytical **tools**, and synthesizes a structured Markdown report — all streamed in real-time via WebSocket.

- 🌐 User submits a query via the React frontend
- 🧠 LangGraph orchestrates 9 specialized AI agents in dependency order
- 📚 Agentic RAG retrieves context from 5 domain-specific knowledge collections
- 🛠️ Built-in tools run carbon, budget, policy, weather, and maps analysis
- 📡 Real-time agent progress streams to the UI via WebSocket
- 📄 A structured Markdown report is generated and persisted to PostgreSQL

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph FE["🌐 React Frontend — Port 3000"]
        direction TB
        UI["Dashboard · Query Planner · Reports\nAnalytics · Documents · Agents"]
        TS["TanStack Router · Framer Motion · Recharts\nRadix UI · TailwindCSS 4"]
    end

    subgraph BE["⚙️ FastAPI Backend — Port 8000"]
        direction TB
        MW["Request Logger · CORS · Exception Handlers"]
        subgraph ORC["🧠 LangGraph StateGraph Orchestrator"]
            direction LR
            PL[Planner] --> RE[Research]
            RE --> SDG & POL & ENV & FIN & RISK & TL
            SDG & POL & ENV & FIN & RISK & TL --> RPT[Report]
        end
        subgraph RAG["📚 RAG Pipeline"]
            direction TB
            CHR["ChromaDB / Qdrant\n5 Domain Collections"]
            EMB["all-MiniLM-L6-v2\nEmbeddings"]
        end
        subgraph TOOLS["🛠️ Built-in Tools"]
            direction TB
            T1[CarbonTool] & T2[BudgetTool]
            T3[MapsTool] & T4[WeatherTool]
            T5[PolicyTool] & T6[SearchTool]
        end
    end

    subgraph DATA["🗄️ Data Layer"]
        direction LR
        PG[("PostgreSQL\nQuery + Report History")]
        RD[("Redis\nCache Layer")]
        VDB[("Qdrant Cloud\nVector Store")]
    end

    FE -- "REST + WebSocket" --> BE
    BE --> DATA
    ORC -- "Hybrid Retrieval" --> RAG
    ORC -- "Tool Execution" --> TOOLS

    style FE fill:#1a1a2e,stroke:#61DAFB,color:#61DAFB
    style BE fill:#1a1a2e,stroke:#009688,color:#009688
    style ORC fill:#0f3460,stroke:#6C3483,color:#e0e0e0
    style RAG fill:#0f3460,stroke:#FF6B35,color:#e0e0e0
    style TOOLS fill:#0f3460,stroke:#F26822,color:#e0e0e0
    style DATA fill:#1a1a2e,stroke:#336791,color:#336791
```

---

## 🧩 Components

### 🔹 1. FastAPI Backend

- ✅ **13 REST endpoints** + 1 WebSocket endpoint under `/api/v1/`
- 🔐 UUID-based request tracing (`X-Request-ID` header on every request)
- 🌐 Configurable CORS via `ALLOWED_ORIGINS` environment variable
- ⚠️ Global exception handlers — uniform `{ success, error, status }` envelope
- 📊 Auto-created PostgreSQL tables on startup via SQLAlchemy
- 🔄 Health checks for PostgreSQL, Redis, and Qdrant on startup

---

### 🔹 2. LangGraph Multi-Agent Orchestrator

- 🧠 **Compiled `StateGraph`** — lazy-initialized on first request, reused for all subsequent queries
- 📋 **Planner** selects which agents to run using JSON-mode LLM + deterministic keyword fallback
- 🔗 **Dependency-resolved execution** — agents run in topological order automatically
- 🔄 All agents share a typed `GraphState` — outputs flow from one agent to the next
- 🛡️ Each agent uses **Tenacity retry logic** (3 attempts, exponential backoff)
- 🧹 `json_repair` library auto-fixes malformed LLM JSON outputs

---

### 🔹 3. Agentic RAG Pipeline

- 📄 Upload PDFs via the frontend — auto-chunked (1000 chars, 150-char overlap) and embedded
- 🔍 **Hybrid search** — semantic cosine similarity + keyword frequency scoring
- 🗂️ **Domain-aware retrieval** — only queries collections relevant to active agents
- 📏 Distance threshold filtering — chunks beyond `1.2` cosine distance are excluded
- 🌐 Source diversity filter — caps 2 chunks per source file when ≥3 sources exist
- 🔄 Automatic fallback to all collections if domain collections are empty

---

### 🔹 4. Built-in Analytical Tools

- 🌡️ **CarbonTool** — estimates CO₂ emissions from electricity, diesel, petrol, transport, waste
- 💰 **BudgetTool** — computes total cost, net investment, payback period, ROI, and lifetime savings
- 🗺️ **MapsTool** — geocodes location names to lat/lon via OpenStreetMap Nominatim
- ☁️ **WeatherTool** — fetches live weather (temperature, humidity, wind, precipitation) via Open-Meteo
- 📜 **PolicyTool** — rule-based compliance checker (protected areas, scale thresholds, subsidy eligibility)
- 🔎 **SearchTool** — DuckDuckGo instant answers for sustainability queries
- ⚡ **Tool Executor** — wraps every tool call with metadata capture + WebSocket `tool_started/completed/failed` events

---

### 🔹 5. React Frontend

- 📊 **Dashboard** — live stats, time-series AreaChart, recent activity feed
- 🗺️ **Query Planner (`/plan`)** — main AI interface: query input, domain selector, file upload, agent panel, real-time execution monitor, Markdown report viewer
- 📄 **Documents (`/documents`)** — PDF knowledge base management (upload, list, delete, download)
- 🧠 **Knowledge Base (`/knowledge`)** — ChromaDB collection stats and per-domain chunk counts
- 📜 **History (`/history`)** — paginated query/report history with filtering and sorting
- 📑 **Reports (`/reports`)** — Markdown report browser with full-report detail view
- 📈 **Analytics (`/analytics`)** — time-series charts for queries, reports, uploads + agent stats
- 🤖 **Agents (`/agents`)** — per-agent operational dashboard with execution metrics
- ⚡ **Execution Monitor (`/execution`)** — real-time tool/agent execution trace via WebSocket
- ⚙️ **Settings (`/settings`)** — system configuration viewer
- 📤 **PDF Export** — reports can be exported as PDFs via `@react-pdf/renderer`

---

## 🤖 Multi-Agent Pipeline

### Agent Registry

| 🤖 Agent | 🎯 Role | 📤 Output |
|---|---|---|
| **Planner** | Routes the query to the correct agents using JSON-mode LLM + keyword fallback | `{objective, required_agents}` |
| **Research** | RAG gateway — domain-aware hybrid retrieval from knowledge base, then LLM synthesis | `{findings, references, summary, ...}` |
| **SDG** | Maps the query to UN Sustainable Development Goals | JSON agent output |
| **Policy** | Analyzes regulatory and government compliance angles | JSON agent output |
| **Environmental** | Carbon, emissions, and ecosystem impact analysis | JSON agent output |
| **Finance** | Budget, cost, ROI, and funding analysis | JSON agent output |
| **Risk** | Hazard, vulnerability, and mitigation analysis | JSON agent output |
| **Timeline** | Roadmap, phase, and milestone planning | JSON agent output |
| **Report** | Synthesizes all agent outputs into a structured Markdown report | Markdown string |

### Agent Dependency Graph

```mermaid
flowchart LR
    RE(["🔬 Research\n— RAG Gateway"])
    SDG(["🎯 SDG\n— UN Goals"])
    POL(["📜 Policy\n— Compliance"])
    ENV(["🌿 Environmental\n— Carbon/Ecosystem"])
    FIN(["💰 Finance\n— Budget/ROI"])
    RISK(["⚠️ Risk\n— Hazard/Mitigation"])
    TL(["📅 Timeline\n— Roadmap"])
    RPT(["📄 Report\n— Markdown Synthesis"])

    RE --> SDG & POL & ENV & FIN & RISK & TL
    SDG & POL & ENV & FIN & RISK & TL --> RPT

    style RE  fill:#1565C0,stroke:#42A5F5,color:#fff
    style SDG fill:#1B5E20,stroke:#66BB6A,color:#fff
    style POL fill:#4A148C,stroke:#AB47BC,color:#fff
    style ENV fill:#1B5E20,stroke:#66BB6A,color:#fff
    style FIN fill:#E65100,stroke:#FFA726,color:#fff
    style RISK fill:#B71C1C,stroke:#EF5350,color:#fff
    style TL  fill:#0D47A1,stroke:#42A5F5,color:#fff
    style RPT fill:#37474F,stroke:#90A4AE,color:#fff
```

> Only agents selected by the Planner are executed. Unselected agents are pre-marked `"skipped"`. The dependency resolver automatically adds required parent agents (e.g. if `risk` is requested, `research` is added automatically).

### Execution Flow

```mermaid
flowchart TD
    START(["🚀 User Query Received"])
    PLAN["🧠 Planner Node\nJSON-mode Groq LLM\n+ Keyword Fallback Routing\n+ Topological Sort"]
    RES["🔬 Research Node\nDomain-aware RAG Retrieval\nHybrid Scoring\n→ retrieved_context"]
    SPEC["🤖 Specialist Agents\nSDG · Policy · Environmental\nFinance · Risk · Timeline\n(in dependency order)"]
    TOOL["🛠️ Tool Execution\nCarbonTool · BudgetTool\nMapsTool · WeatherTool\nPolicyTool · SearchTool"]
    RPT["📄 Report Node\nAggregate all outputs\nCompute overall_confidence\nGenerate Markdown"]
    DB[("🗄️ PostgreSQL\nQueryHistory + ReportHistory")]
    WS["📡 WebSocket Broadcast\nagent_started/completed/failed\ntool_started/completed/failed"]
    END(["✅ QueryResponse returned to client"])

    START --> PLAN
    PLAN -- "selected agents + order" --> RES
    RES -- "retrieved_context" --> SPEC
    SPEC -- "invokes" --> TOOL
    TOOL -- "tool output" --> SPEC
    SPEC -- "agent outputs" --> RPT
    RPT --> END
    END -. "fire-and-forget" .-> DB
    PLAN & RES & SPEC & TOOL & RPT -- "real-time events" --> WS

    style START fill:#1B5E20,stroke:#66BB6A,color:#fff
    style PLAN  fill:#1565C0,stroke:#42A5F5,color:#fff
    style RES   fill:#4A148C,stroke:#AB47BC,color:#fff
    style SPEC  fill:#E65100,stroke:#FFA726,color:#fff
    style TOOL  fill:#37474F,stroke:#90A4AE,color:#fff
    style RPT   fill:#0D47A1,stroke:#42A5F5,color:#fff
    style DB    fill:#1a1a2e,stroke:#336791,color:#90A4AE
    style WS    fill:#1a1a2e,stroke:#009688,color:#80CBC4
    style END   fill:#1B5E20,stroke:#66BB6A,color:#fff
```

### Confidence Scoring

Each agent output receives an automatically computed `confidence_score`:

| Condition | Effect |
|---|---|
| Base score | +0.50 |
| Per finding (max 5) | +0.10 each |
| Per recommendation | +0.05 each |
| Per reference | +0.03 each |
| Empty `summary` | ×0.50 penalty |
| `status = "success"` | +0.15 |
| `status = "incomplete"` | −0.05 |
| Final clamp | [0.0, 1.0] |

---

## ✨ Key Features

| 🚀 Feature | 🌐 Frontend | ⚙️ Backend | 🧠 Agents | 📚 RAG | 🛠️ Tools |
|---|:---:|:---:|:---:|:---:|:---:|
| Natural-language query | ✓ | ✓ | | | |
| Dynamic agent routing | | ✓ | ✓ | | |
| Domain-aware RAG retrieval | | | ✓ | ✓ | |
| PDF upload & ingestion | ✓ | ✓ | | ✓ | |
| Carbon footprint analysis | | | ✓ | | ✓ |
| Budget & ROI computation | | | ✓ | | ✓ |
| Policy compliance check | | | ✓ | | ✓ |
| Live weather integration | | | ✓ | | ✓ |
| Geolocation/mapping | | | ✓ | | ✓ |
| Real-time WebSocket stream | ✓ | ✓ | | | |
| SDG mapping | | | ✓ | ✓ | |
| Risk assessment | | | ✓ | ✓ | |
| Timeline / roadmap planning | | | ✓ | ✓ | |
| Structured Markdown report | ✓ | ✓ | ✓ | | |
| PDF report export | ✓ | | | | |
| Query & report history | ✓ | ✓ | | | |
| Analytics dashboard | ✓ | ✓ | | | |
| Agent execution metrics | ✓ | ✓ | | | |

---

## 🧰 Tech Stack

<p align="center">
<img src="https://skillicons.dev/icons?i=python,fastapi,react,ts,postgres,redis,docker" />
</p>

### ⚙️ Backend

![FastAPI](https://img.shields.io/badge/FastAPI-0.139-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1.3.13-1C3C3C?logo=langchain&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-1.2.9-6C3483)
![Uvicorn](https://img.shields.io/badge/Uvicorn-0.51-499848)
![Tenacity](https://img.shields.io/badge/Tenacity-9.1.4-blue)

### 🧠 LLM & AI

![Groq](https://img.shields.io/badge/Groq-openai%2Fgpt--oss--20b-F26822?logo=groq)
![LangChain Groq](https://img.shields.io/badge/langchain--groq-1.1.3-1C3C3C)
![Sentence Transformers](https://img.shields.io/badge/SentenceTransformers-5.6.0-orange)
![json_repair](https://img.shields.io/badge/json__repair-0.61.6-blueviolet)

### 📚 Vector Store & RAG

![ChromaDB](https://img.shields.io/badge/ChromaDB-1.5.9-FF6B35)
![Qdrant](https://img.shields.io/badge/Qdrant-Cloud-DC143C?logo=qdrant)
![pypdf](https://img.shields.io/badge/pypdf-6.14.2-4B8BBE)
![all-MiniLM-L6-v2](https://img.shields.io/badge/Embedding-all--MiniLM--L6--v2-yellow)

### 🗄️ Data & Cache

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16--alpine-336791?logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0.51-red)
![Redis](https://img.shields.io/badge/Redis-7--alpine-DC382D?logo=redis&logoColor=white)

### 🌐 Frontend

![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)
![TanStack Router](https://img.shields.io/badge/TanStack%20Router-1.170-FF4154)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38BDF8?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12.x-EF008F)
![Recharts](https://img.shields.io/badge/Recharts-2.x-22B5BF)
![Radix UI](https://img.shields.io/badge/Radix%20UI-Primitives-161618)

### 🐳 DevOps & Deployment

![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white)
![Neon](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E599?logo=neon)
![Upstash](https://img.shields.io/badge/Cache-Upstash%20Redis-00E9A3?logo=upstash)

---

## 📚 RAG System

### Document Ingestion Pipeline

```mermaid
flowchart LR
    UP(["📤 PDF Upload"])
    VAL["✅ Validate\next=.pdf · MIME check\nsize ≤ 25 MB"]
    DUP{"Duplicate\nin ChromaDB?"}
    DISK["💾 Save to Disk\ndata/raw/domain/"]
    LOAD["📖 Load PDF\npypdf page-by-page"]
    CHUNK["✂️ Chunker\n1000-char chunks\n150-char overlap"]
    EMBED["🔢 Embedder\nall-MiniLM-L6-v2\nsentence-transformers"]
    STORE["🗃️ Vector Store\nChromaDB / Qdrant\nwith metadata"]
    ERR(["❌ Rejected"])

    UP --> VAL --> DUP
    DUP -- "No" --> DISK --> LOAD --> CHUNK --> EMBED --> STORE
    DUP -- "Yes" --> ERR

    style UP    fill:#1565C0,stroke:#42A5F5,color:#fff
    style VAL   fill:#1B5E20,stroke:#66BB6A,color:#fff
    style DUP   fill:#E65100,stroke:#FFA726,color:#fff
    style DISK  fill:#4A148C,stroke:#AB47BC,color:#fff
    style LOAD  fill:#4A148C,stroke:#AB47BC,color:#fff
    style CHUNK fill:#37474F,stroke:#90A4AE,color:#fff
    style EMBED fill:#0D47A1,stroke:#42A5F5,color:#fff
    style STORE fill:#1B5E20,stroke:#66BB6A,color:#fff
    style ERR   fill:#B71C1C,stroke:#EF5350,color:#fff
```

**Chunk metadata stored per chunk:** `source` (filename), `page`, `domain`, `chunk_index`

### Domain Collections

Five knowledge collections (one per domain):

| 🗂️ Domain | 📄 Content |
|---|---|
| `research` | General sustainability research reports |
| `sdg` | UN Sustainable Development Goals documents |
| `policy` | Government policy and regulatory documents |
| `environmental` | Climate and environmental impact reports |
| `finance` | Budget, funding, and cost/ROI references |

### Hybrid Retrieval Scoring

```mermaid
flowchart TD
    QRY(["🔍 Query from Agent"])
    SCOPE["🖼️ Domain Scoping\nOnly query collections\nmatching active agents"]
    SEM["🧠 Semantic Search\nCosine distance\n(all-MiniLM-L6-v2)"]
    KEY["🔤 Keyword Scoring\nWord frequency count\nin chunk text"]
    SCORE["➕ Hybrid Score\n1/(1+distance) + 0.2×keywords"]
    FILTER{"distance\n> 1.2?"}
    BOOST["🚀 Domain Relevance Boost\n×1.10× if from\ndirectly-selected domain"]
    DIV["🔄 Source Diversity\nMax 2 chunks per source\nwhen ≥3 sources available"]
    FB{"Domain collections\nempty?"}
    FALL["⚠️ Fallback\nRetrieve from\nall collections"]
    OUT(["✅ Top-K Chunks returned\n(default k=5)"])
    DISC(["❌ Discarded"])

    QRY --> SCOPE --> SEM & KEY --> SCORE --> FILTER
    FILTER -- "No" --> BOOST --> DIV --> FB
    FILTER -- "Yes" --> DISC
    FB -- "No" --> OUT
    FB -- "Yes" --> FALL --> OUT

    style QRY   fill:#1565C0,stroke:#42A5F5,color:#fff
    style SCOPE fill:#4A148C,stroke:#AB47BC,color:#fff
    style SEM   fill:#0D47A1,stroke:#42A5F5,color:#fff
    style KEY   fill:#0D47A1,stroke:#42A5F5,color:#fff
    style SCORE fill:#37474F,stroke:#90A4AE,color:#fff
    style FILTER fill:#E65100,stroke:#FFA726,color:#fff
    style BOOST fill:#1B5E20,stroke:#66BB6A,color:#fff
    style DIV   fill:#1B5E20,stroke:#66BB6A,color:#fff
    style FB    fill:#E65100,stroke:#FFA726,color:#fff
    style FALL  fill:#B71C1C,stroke:#EF5350,color:#fff
    style OUT   fill:#1B5E20,stroke:#66BB6A,color:#fff
    style DISC  fill:#B71C1C,stroke:#EF5350,color:#fff
```

- **Semantic**: Cosine distance on `all-MiniLM-L6-v2` embeddings
- **Keyword**: Word frequency count in chunk text
- Chunks with `distance > 1.2` are filtered out
- Domain-relevant chunks receive a **1.10× score multiplier**
- Source diversity: max 2 chunks per source file when ≥3 sources are available
- Fallback: retrieves from all collections if domain collections are empty

### RAG Validation Results

| 🔍 Query | 🗂️ Domain | ✅ Result |
|---|---|---|
| Renewable energy | finance | Retrieves World Bank/IRENA report |
| Green India Mission | policy | Retrieves Green India Mission document |
| Climate change adaptation | environmental | Retrieves IPCC report |
| Emissions gap | research | Retrieves UNEP research report |
| Sustainable development goals | sdg | Retrieves SDG report |

---

## 🛠️ Built-in Tools

All tools are wrapped by `execute_tool_with_metadata()` which captures execution metrics and broadcasts real-time WebSocket events (`tool_started`, `tool_completed`, `tool_failed`).

### Tool Execution Lifecycle

```mermaid
flowchart LR
    AGT(["🤖 Agent calls tool"])
    WS1["📡 WS: tool_started\ntool_name, agent_name\ntimestamp"]
    EXE["⚡ Tool Function Executes\nCapture: started_at, input_summary"]
    OK{"Success?"}
    META_OK["📊 Metadata Record\nstatus=Completed\nexecution_time_ms\noutput_summary"]
    META_ERR["📊 Metadata Record\nstatus=Failed\nerror message"]
    WS2["📡 WS: tool_completed\noutput_summary, ms"]
    WS3["📡 WS: tool_failed\nerror, ms"]
    STATE["📝 Append to\nstate tool_executions"]
    RET_OK(["✅ Return output\nto agent"])
    RET_ERR(["❌ Re-raise exception"])

    AGT --> WS1 --> EXE --> OK
    OK -- "Yes" --> META_OK --> WS2 --> STATE --> RET_OK
    OK -- "No"  --> META_ERR --> WS3 --> STATE --> RET_ERR

    style AGT     fill:#1565C0,stroke:#42A5F5,color:#fff
    style WS1     fill:#1a1a2e,stroke:#009688,color:#80CBC4
    style EXE     fill:#4A148C,stroke:#AB47BC,color:#fff
    style OK      fill:#E65100,stroke:#FFA726,color:#fff
    style META_OK fill:#37474F,stroke:#90A4AE,color:#fff
    style META_ERR fill:#37474F,stroke:#90A4AE,color:#fff
    style WS2     fill:#1a1a2e,stroke:#009688,color:#80CBC4
    style WS3     fill:#1a1a2e,stroke:#B71C1C,color:#EF9A9A
    style STATE   fill:#0D47A1,stroke:#42A5F5,color:#fff
    style RET_OK  fill:#1B5E20,stroke:#66BB6A,color:#fff
    style RET_ERR fill:#B71C1C,stroke:#EF5350,color:#fff
```

### 🌡️ CarbonTool

Estimates CO₂ emissions from multiple sources:

| Source | Emission Factor |
|---|---|
| Electricity | 0.82 kg CO₂/kWh |
| Diesel | 2.68 kg CO₂/litre |
| Petrol | 2.31 kg CO₂/litre |
| Transport | 0.12 kg CO₂/km |
| Waste | 0.45 kg CO₂/kg |

### 💰 BudgetTool

Computes project financial metrics:
- Total cost (equipment + labor + land + other)
- Net investment after subsidies
- Payback period (years)
- ROI percentage over project lifetime
- Lifetime savings

### 🗺️ MapsTool

- Geocodes location names → latitude/longitude via **OpenStreetMap Nominatim**

### ☁️ WeatherTool

- Fetches live weather via **Open-Meteo API** (free, no API key required)
- Returns: temperature, humidity, precipitation, wind speed

### 📜 PolicyTool

- Rule-based compliance checker
- Flags protected area warnings, large-scale regulatory approvals, and solar subsidy eligibility

### 🔎 SearchTool

- DuckDuckGo instant answer API for quick sustainability fact lookups

---

## 🔗 API Reference

All routes are under `/api/v1/` prefix.

### 📊 Core

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Welcome message — API liveness |
| `POST` | `/api/v1/query` | Submit a sustainability query → runs full multi-agent pipeline → returns structured report |

**Request body:**
```json
{ "query": "string" }
```

**Response includes:** `request_id`, `status`, `planner_output`, `report` (Markdown), per-agent `outputs`, `agent_status`, `errors`, `missing_information`, `retrieved_chunks`, `retrieved_domains`, `execution_time`, `confidence`

---

### 📄 Documents — Knowledge Base Management

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/documents/upload` | Upload a PDF into a knowledge domain (`sdg`, `environmental`, `policy`, `finance`, `research`) |
| `GET` | `/api/v1/documents` | List all documents across all domains |
| `DELETE` | `/api/v1/documents?id=domain:filename` | Delete a document by composite ID |
| `GET` | `/api/v1/documents/download?id=domain:filename` | Download/preview a PDF inline |

> **Upload validations:** `.pdf` extension only, MIME type `application/pdf`, max 25 MB, duplicate detection via ChromaDB

---

### 📜 History & Reports

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/history` | Paginated combined history (queries + reports) — supports `skip`, `limit`, `query`, `sort` |
| `GET` | `/api/v1/reports` | Paginated report list with title/summary extraction |
| `GET` | `/api/v1/reports/{report_id}` | Full report detail including Markdown content, planner output, confidence, execution time |

---

### 📈 Analytics & Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/dashboard` | Aggregated stats: total queries/reports, knowledge base breakdown, recent activity |
| `GET` | `/api/v1/analytics` | Time-series data (daily/weekly/monthly): queries, reports, uploads, per-domain/per-agent stats |
| `GET` | `/api/v1/knowledge-base` | ChromaDB collection stats: total documents, chunks, per-domain breakdown |

---

### ⚙️ System & Agents

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Infrastructure liveness — per-service `connected`/`disconnected` status |
| `GET` | `/api/v1/system/status` | Service connectivity (Postgres, Redis, ChromaDB), total document/chunk/agent counts |
| `GET` | `/api/v1/agents/status` | Per-agent operational metrics: status, execution count, last run timestamp, avg execution time |
| `GET` | `/api/v1/settings` | Public configuration: organisation, region, service flags |

---

### 📡 WebSocket

| Protocol | Path | Description |
|---|---|---|
| `WS` | `/api/v1/ws` | Persistent connection for real-time agent and tool execution events |

---

## 📡 WebSocket Events

The server broadcasts the following events to all connected clients during query execution:

```mermaid
sequenceDiagram
    autonumber
    participant FE as 🌐 Frontend
    participant WS as 📡 WebSocket Manager
    participant ORC as 🧠 Orchestrator
    participant AGT as 🤖 Agent Node
    participant TOOL as 🛠️ Tool

    FE->>WS: Connect (ws://host/api/v1/ws)
    WS-->>FE: {type: "connected", message: "Connected to EarthMind AI"}

    FE->>ORC: POST /api/v1/query
    ORC->>AGT: invoke Planner
    AGT->>WS: broadcast_agent_started("Planner")
    WS-->>FE: {type: "agent_started", agent: "Planner"}
    AGT-->>ORC: planner_output
    AGT->>WS: broadcast_agent_completed("Planner")
    WS-->>FE: {type: "agent_completed", agent: "Planner"}

    ORC->>AGT: invoke Research
    AGT->>WS: broadcast_agent_started("Research")
    WS-->>FE: {type: "agent_started", agent: "Research"}
    AGT->>TOOL: execute_tool_with_metadata("SearchTool")
    TOOL->>WS: broadcast_tool_started
    WS-->>FE: {type: "tool_started", tool: "SearchTool"}
    TOOL-->>AGT: result
    TOOL->>WS: broadcast_tool_completed
    WS-->>FE: {type: "tool_completed", tool: "SearchTool", execution_time_ms: 42}
    AGT-->>ORC: research output
    AGT->>WS: broadcast_agent_completed("Research")
    WS-->>FE: {type: "agent_completed", agent: "Research"}

    Note over ORC,AGT: Specialist agents run in dependency order...

    ORC->>AGT: invoke Report
    AGT->>WS: broadcast_agent_started("Report")
    WS-->>FE: {type: "agent_started", agent: "Report"}
    AGT-->>ORC: Markdown report
    AGT->>WS: broadcast_agent_completed("Report")
    WS-->>FE: {type: "agent_completed", agent: "Report"}

    ORC-->>FE: QueryResponse (REST)
```

The **`useAgentWebSocket()`** React hook on the frontend:
- Opens a WebSocket connection on component mount, closes on unmount
- Derives `agentStatuses[]` (queued → running → done/error) from incoming events
- Auto-reconnects with exponential backoff (1s → 30s max)
- Exposes `events[]`, `agentStatuses[]`, `isConnected`, `reset()`

---

## 📁 Project Structure

```
EarthMind-AI/
│
├── backend/
│   ├── app/
│   │   ├── main.py                    FastAPI app factory + middleware registration
│   │   ├── database.py                SQLAlchemy table auto-creation
│   │   │
│   │   ├── agents/                    9 specialized AI agents
│   │   │   ├── planner/agent.py       PlannerAgent + deterministic routing fallback
│   │   │   ├── research/agent.py      ResearchAgent + RAG + domain retrieval
│   │   │   ├── environmental/agent.py EnvironmentalAgent (carbon/ecosystem analysis)
│   │   │   ├── policy/agent.py        PolicyAgent (regulatory compliance)
│   │   │   ├── finance/agent.py       FinanceAgent (budget/ROI/funding)
│   │   │   ├── risk/agent.py          RiskAgent (hazard/vulnerability)
│   │   │   ├── timeline/agent.py      TimelineAgent (roadmap/milestones)
│   │   │   ├── sdg/agent.py           SDGAgent (UN SDG mapping)
│   │   │   └── report/agent.py        ReportAgent (Markdown synthesis, no JSON)
│   │   │
│   │   ├── orchestrator/              LangGraph pipeline
│   │   │   ├── graph.py               StateGraph definition (lazy compiled)
│   │   │   ├── state.py               GraphState TypedDict
│   │   │   ├── nodes.py               Node functions for each agent
│   │   │   ├── routing.py             Conditional edge functions
│   │   │   ├── dependencies.py        Agent dependency DAG + topological resolver
│   │   │   ├── helpers.py             Pure helpers (status, errors, missing_info)
│   │   │   └── agent_executor.py      Thread-safe async bridge for WS broadcasts
│   │   │
│   │   ├── tools/                     Domain analytical tools
│   │   │   ├── carbon.py              CO₂ emission calculator
│   │   │   ├── budget.py              Financial analysis (cost, ROI, payback)
│   │   │   ├── maps.py                Geocoding via OpenStreetMap Nominatim
│   │   │   ├── weather.py             Live weather via Open-Meteo API
│   │   │   ├── policy.py              Rule-based compliance checker
│   │   │   ├── search.py              DuckDuckGo instant answer lookup
│   │   │   └── executor.py            Tool executor with metadata capture + WS events
│   │   │
│   │   ├── rag/                       Retrieval-Augmented Generation
│   │   │   ├── config.py              Domains, paths, chunk config (edit here to add domains)
│   │   │   ├── ingest.py              Full ingestion pipeline
│   │   │   ├── pdf_loader.py          pypdf wrapper
│   │   │   ├── chunker.py             Text chunking with overlap
│   │   │   ├── embedder.py            SentenceTransformer wrapper (lazy cached)
│   │   │   ├── retriever.py           Hybrid search (semantic + keyword)
│   │   │   ├── domain_retriever.py    Domain-aware retrieval with boost + diversity
│   │   │   └── vector_store.py        ChromaDB/Qdrant client wrapper
│   │   │
│   │   ├── api/
│   │   │   ├── v1/router.py           All route registrations
│   │   │   └── routes/                13 endpoint files (query, documents, reports, ...)
│   │   │
│   │   ├── core/
│   │   │   ├── base_agent.py          BaseAgent (retry, JSON parsing, confidence scoring)
│   │   │   ├── utils.py               calculate_confidence, fallback_response, helpers
│   │   │   ├── lifespan.py            App startup/shutdown lifecycle
│   │   │   ├── exception_handlers.py  Global error handling
│   │   │   ├── exceptions.py          Custom exception types
│   │   │   ├── request_logger.py      Request ID + timing middleware
│   │   │   └── cors.py                CORS configuration
│   │   │
│   │   ├── models/
│   │   │   ├── query_history.py       QueryHistory SQLAlchemy model
│   │   │   └── report_history.py      ReportHistory SQLAlchemy model
│   │   │
│   │   ├── services/                  Service singletons
│   │   │   ├── llm.py                 get_llm() + get_planner_llm() (JSON mode)
│   │   │   ├── history.py             History CRUD service
│   │   │   ├── documents.py           Document listing/deletion service
│   │   │   ├── analytics.py           Analytics aggregation service
│   │   │   ├── dashboard.py           Dashboard stats service
│   │   │   ├── knowledge_base.py      ChromaDB stats service
│   │   │   ├── postgres.py            SQLAlchemy engine + session factory
│   │   │   ├── redis.py               Redis client singleton
│   │   │   └── qdrant.py              Qdrant Cloud client singleton
│   │   │
│   │   ├── websocket/
│   │   │   ├── manager.py             ConnectionManager singleton
│   │   │   ├── events.py              broadcast_agent_* + broadcast_tool_* functions
│   │   │   └── routes.py              WS endpoint /api/v1/ws
│   │   │
│   │   └── prompts/                   One prompt file per agent
│   │       ├── planner_prompt.py      Concise, example-driven routing prompt
│   │       ├── research_prompt.py     RAG-aware research prompt
│   │       ├── report_prompt.py       Markdown synthesis prompt (11 KB)
│   │       ├── [agent]_prompt.py      Domain-specific prompts (env, policy, finance, risk, timeline, sdg)
│   │       └── json_prompt.py         Shared JSON output enforcement instructions
│   │
│   ├── Dockerfile                     Backend container image
│   ├── requirements.txt               126 pinned Python packages
│   └── .env.example                   Environment variable template
│
├── frontend/
│   └── src/
│       ├── routes/                    11 TanStack file-based page routes
│       │   ├── index.tsx              Dashboard
│       │   ├── plan.tsx               Query Planner (main AI interface, 41 KB)
│       │   ├── documents.tsx          PDF knowledge base management
│       │   ├── knowledge.tsx          Knowledge base stats
│       │   ├── history.tsx            Query/report history browser
│       │   ├── reports.tsx            Report browser with Markdown viewer
│       │   ├── analytics.tsx          Time-series charts and agent stats
│       │   ├── agents.tsx             Agent status dashboard
│       │   ├── execution.tsx          Real-time execution monitor
│       │   ├── data-sources.tsx       Data source management
│       │   └── settings.tsx           System configuration
│       │
│       ├── services/                  API + WebSocket client layer
│       │   ├── api.ts                 apiRequest() wrapper (base URL, error handling)
│       │   ├── types.ts               TypeScript interfaces for all API types (357 lines)
│       │   ├── websocket.service.ts   EarthMindWebSocket class (auto-reconnect)
│       │   └── *.service.ts           One service file per backend resource
│       │
│       ├── components/
│       │   ├── app-sidebar.tsx        Navigation sidebar
│       │   ├── topbar.tsx             Top navigation bar
│       │   └── ui/                    Radix UI + shadcn component library
│       │
│       ├── hooks/                     React hooks (useAgentWebSocket, etc.)
│       ├── pdf/                       @react-pdf/renderer PDF export logic
│       └── styles.css                 Global styles (TailwindCSS 4)
│
├── data/
│   ├── raw/                           PDF knowledge base (5 domain folders)
│   │   ├── sdg/
│   │   ├── environmental/
│   │   ├── policy/
│   │   ├── finance/
│   │   └── research/
│   └── vectorstore/                   ChromaDB persistent data
│
├── docker-compose.yml                 4-service container stack
├── requirements.txt                   Root-level dependencies
├── runtime.txt                        Python runtime specification
└── docs/                              Project documentation
    ├── RAG_VALIDATION.md              RAG retrieval validation results
    └── api/                           API documentation
```

---

## 🚀 Getting Started

### 🐳 Option A — Docker (Recommended)

Runs the entire stack in containers with a single command.

**Prerequisites:** Docker Desktop

```bash
# 1. Clone the repository
git clone https://github.com/Kailasss2k05/EarthMind-AI.git
cd EarthMind-AI

# 2. Set up environment variables
cd backend
copy .env.example .env
# Edit .env and fill in GROQ_API_KEY, DATABASE_URL, REDIS_URL, and QDRANT credentials

# 3. Start the full stack from the root
cd ..
docker compose up --build -d

# 4. Watch logs
docker compose logs -f

# 5. Stop all services
docker compose down
```

Once running:
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8000/docs`
- **WebSocket:** `ws://localhost:8000/api/v1/ws`

---

### ⚙️ Option B — Manual Setup

**Prerequisites:** Python 3.11+, Node.js 18+, Docker Desktop (for Postgres + Redis)

```bash
# 1. Clone the repository
git clone https://github.com/Kailasss2k05/EarthMind-AI.git
cd EarthMind-AI

# 2. Start PostgreSQL and Redis
docker compose up -d postgres redis

# 3. Set up backend environment
cd backend
copy .env.example .env
# Fill in all required values (GROQ_API_KEY, DATABASE_URL, REDIS_URL, QDRANT_URL, QDRANT_API_KEY)

# 4. Install backend dependencies
pip install -r requirements.txt

# 5. Run the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 6. Install and run the frontend (separate terminal)
cd ../frontend
npm install
npm run dev
```

---

### 📄 Populate the Knowledge Base

Upload PDFs via the frontend at `/documents`, or use the ingestion script:

```bash
# Place PDF files in data/raw/{domain}/ (sdg, environmental, policy, finance, research)
cd backend
python -m app.rag.ingest
```

---

## ⚙️ Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the following:

```env
# ── App ───────────────────────────────────────────────────────────────
APP_NAME=EarthMind AI
APP_VERSION=0.1.0
DEBUG=True

# ── LLM (Groq) ────────────────────────────────────────────────────────
# Get your API key at https://console.groq.com
GROQ_API_KEY=gsk_...
MODEL_NAME=openai/gpt-oss-20b   # Default model; change to any Groq-supported model
TEMPERATURE=0

# ── PostgreSQL (Neon or local) ─────────────────────────────────────────
# Use postgresql+psycopg:// (psycopg v3 dialect) — NOT postgresql://
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/earthmind

# ── Redis (Upstash or local) ──────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Qdrant Cloud ──────────────────────────────────────────────────────
# Sign up at https://cloud.qdrant.io — collections are created automatically on first use
QDRANT_URL=https://<cluster-id>.<region>.cloud.qdrant.io
QDRANT_API_KEY=
QDRANT_COLLECTION=earthmind

# ── HuggingFace (for embedding API fallback) ──────────────────────────
# Get a free token at https://huggingface.co/settings/tokens
HF_API_TOKEN=hf_...

# ── CORS / Frontend ───────────────────────────────────────────────────
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
```

### Frontend Environment Variables

Set in `frontend/.env` or via your deployment platform:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🏭 Production Deployment

| Layer | Service |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |
| Cache | Upstash Redis |
| Vector Store | Qdrant Cloud |
| LLM | Groq (openai/gpt-oss-20b) |

---

## 📊 Project Statistics

| Metric | Value |
|---|---|
| Total REST API endpoints | **13** |
| WebSocket endpoints | **1** |
| LangGraph agent nodes | **9** (Planner, Research, SDG, Policy, Environmental, Finance, Risk, Timeline, Report) |
| Built-in analytical tools | **6** (Carbon, Budget, Maps, Weather, Policy, Search) |
| Knowledge base domains | **5** (SDG, Environmental, Policy, Finance, Research) |
| Frontend pages/routes | **11** |
| PostgreSQL tables | **2** (query_history, report_history) |
| Backend Python modules | ~50 files |
| Python dependencies | 126 pinned packages |
| Frontend npm dependencies | ~65 packages |

---

## 🧪 Troubleshooting & Notes

- **Qdrant connection error on startup:** Verify `QDRANT_URL` and `QDRANT_API_KEY` in `.env`. The app will warn but continue — the query endpoint will fail until Qdrant is connected.
- **Empty RAG responses:** Run the ingestion pipeline (`python -m app.rag.ingest`) after placing PDFs in `data/raw/{domain}/`. The `/documents/upload` endpoint also ingests automatically.
- **LLM returns invalid JSON:** `json_repair` auto-fixes most malformed outputs. If an agent consistently fails, check the Groq API rate limits or increase `TEMPERATURE` slightly.
- **WebSocket not connecting:** Ensure the backend is running and `VITE_API_BASE_URL` points to the correct backend URL. The frontend uses exponential backoff auto-reconnect (1s → 30s).
- **On Windows PowerShell**, use `Copy-Item backend/.env.example backend/.env` instead of `copy`.
- **Docker port conflicts:** If ports 3000, 8000, 5432, or 6379 are already in use, modify the port mappings in `docker-compose.yml`.
- **Redis is connected but not actively caching:** Redis is initialized and health-checked on startup, but the caching layer is prepared for future use. All reads currently go to PostgreSQL directly.

---

<div align="center">

✨ **Built for smarter and more transparent sustainability decision-making** ✨

*IBM SkillsBuild AI Automation & Intelligent Solutions Internship*

</div>
