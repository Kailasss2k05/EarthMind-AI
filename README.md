# 🌍 EarthMind AI

EarthMind AI is a Multi-Agent Sustainability Intelligence Platform developed as part of the IBM SkillsBuild AI Automation & Intelligent Solutions Internship.

## Features

- 🤖 Multi-Agent AI System
- 🧠 LangGraph Orchestration
- 📚 Agentic RAG
- 🌍 SDG Mapping
- 📊 Environmental Impact Analysis
- 💰 Budget & Finance Planning
- 📜 Government Policy Recommendation
- ⚠️ Risk Assessment
- 📅 Timeline Generation
- 📄 Automated Sustainability Reports

## Tech Stack

- React (Vite)
- FastAPI
- LangGraph
- LangChain
- Groq (LLM — GPT OSS 20B)
- ChromaDB
- PostgreSQL (Neon)
- Redis (Upstash)

## Production Deployment

| Layer     | Service              |
|-----------|----------------------|
| Frontend  | Vercel               |
| Backend   | Render               |
| Database  | Neon PostgreSQL      |
| Redis     | Upstash              |
| LLM       | Groq GPT OSS 20B     |

## Quick Start (Local)

1. **Clone the repo and enter the backend directory:**
   ```bash
   cd backend
   cp .env.example .env
   # Fill in GROQ_API_KEY and DATABASE_URL in .env
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the backend:**
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Run supporting services (Postgres + Redis):**
   ```bash
   docker compose up -d postgres redis
   ```

## Environment Variables

| Variable      | Description                         |
|---------------|-------------------------------------|
| `GROQ_API_KEY`| Your Groq API key (required)        |
| `MODEL_NAME`  | Groq model ID (default: `openai/gpt-oss-20b`) |
| `TEMPERATURE` | LLM temperature (default: `0`)      |
| `DATABASE_URL`| Neon PostgreSQL connection string   |
| `REDIS_URL`   | Upstash Redis connection string     |

## Project Status

🚧 Under Development

## Team

IBM SkillsBuild Internship Team
