"""
research/agent.py
-----------------
ResearchAgent - the single RAG gateway for the EarthMind multi-agent system.
"""

import json
import logging
import re

from json_repair import repair_json

from app.core.base_agent import BaseAgent
from app.core.utils import calculate_confidence, fallback_response
from app.prompts.research_prompt import RESEARCH_PROMPT
from app.rag.retriever import retrieve_all

logger = logging.getLogger(__name__)


def _format_chunks(chunks):
    if not chunks:
        return "No documents were retrieved from the knowledge base."
    lines = []
    for idx, chunk in enumerate(chunks, start=1):
        source = chunk.get("source") or "unknown"
        page = chunk.get("page", "?")
        domain = chunk.get("domain", "?")
        text = (chunk.get("text") or "").strip()
        lines.append(
            f"[{idx}] Source: {source} | Page: {page} | Domain: {domain}\n{text}"
        )
    return "\n\n".join(lines)


def _build_references(chunks):
    seen = set()
    refs = []
    for chunk in chunks:
        source = chunk.get("source") or "unknown"
        page = chunk.get("page", "?")
        ref = f"{source} - page {page}"
        if ref not in seen:
            seen.add(ref)
            refs.append(ref)
    return refs


class ResearchAgent(BaseAgent):

    def build_prompt(self, state, rag_context=""):
        return RESEARCH_PROMPT.format(
            query=state["query"],
            planner_output=json.dumps(state.get("planner_output", {}), indent=2),
            shared_missing_information=json.dumps(
                state.get("missing_information", []), indent=2
            ),
            rag_context=rag_context,
        )

    def run(self, state):
        query = state.get("query", "")

        logger.info("[ResearchAgent] Querying ChromaDB with: %r", query)
        try:
            chunks = retrieve_all(query)
            logger.info(
                "[ResearchAgent] Retrieved %d chunks from ChromaDB.", len(chunks)
            )
        except Exception as exc:
            logger.warning(
                "[ResearchAgent] ChromaDB retrieval failed: %s. "
                "Continuing without RAG context.",
                exc,
            )
            chunks = []

        rag_context = _format_chunks(chunks)
        prompt = self.build_prompt(state, rag_context=rag_context)

        try:
            response = self.invoke_llm(prompt)
            content = response.content.strip()

            print(f"\n===== ResearchAgent RAW OUTPUT =====")
            print(content)
            print("====================================\n")

            content = re.sub(r"^```json\s*", "", content, flags=re.IGNORECASE)
            content = re.sub(r"^```\s*", "", content)
            content = re.sub(r"\s*```$", "", content)

            match = re.search(r"\{.*\}", content, re.DOTALL)
            if not match:
                raise json.JSONDecodeError("No JSON object found", content, 0)

            json_text = repair_json(match.group(0))
            result = json.loads(json_text)

            if not result.get("references"):
                result["references"] = _build_references(chunks)

            result["confidence_score"] = calculate_confidence(result)

        except json.JSONDecodeError as exc:
            logger.error("ResearchAgent returned invalid JSON.\n%s", content)
            result = fallback_response("research", str(exc))

        except Exception as exc:
            logger.exception("ResearchAgent failed after all retry attempts.")
            result = fallback_response("research", str(exc))

        return {
            "outputs": {
                **state.get("outputs", {}),
                "research": result,
            },
            "retrieved_context": chunks,
        }
