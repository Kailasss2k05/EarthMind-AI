"""
research/agent.py
-----------------
ResearchAgent - the single RAG gateway for the EarthMind multi-agent system.

Execution order
---------------
1. Read planner-selected agents from state to determine relevant domains.
2. Call retrieve_domains(agent_names, query) for domain-aware retrieval.
   Falls back to retrieve_all() automatically if collections are empty.
3. Format chunks as a numbered context block for the LLM prompt.
4. Build the research prompt with RAG context injected.
5. Invoke the LLM via BaseAgent retry logic.
6. Post-process: populate references from document metadata if LLM returned [].
7. Store raw chunks in state["retrieved_context"] for downstream agents.
"""

import json
import logging
import re
from typing import List

from json_repair import repair_json

from app.core.base_agent import BaseAgent
from app.core.utils import (
    calculate_confidence,
    fallback_response,
    build_references_from_chunks,
)
from app.prompts.research_prompt import RESEARCH_PROMPT
from app.rag.domain_retriever import retrieve_domains
from app.tools.search import SearchInput, SearchTool
from app.tools.executor import execute_tool_with_metadata

logger = logging.getLogger(__name__)

def _format_search_results(results: dict) -> str:
    if not results.get("success"):
        return "No web search results available."

    search_results = results.get("results", [])

    if not search_results:
        return "No web search results available."

    lines = []

    for idx, item in enumerate(search_results, start=1):
        lines.append(
            f"[{idx}] {item.get('title','')}\n"
            f"URL: {item.get('url','')}\n"
            f"{item.get('snippet','')}"
        )

    return "\n\n".join(lines)

def _format_chunks(chunks: List[dict]) -> str:
    """
    Convert retrieved chunks into a numbered plain-text block for the prompt.

    Each chunk is preceded by its index and domain metadata so the LLM
    can cite them in its references section.
    """
    if not chunks:
        return "(No domain documents retrieved for this query.)"

    lines = []
    for idx, chunk in enumerate(chunks, start=1):
        domain  = chunk.get("domain", "general").upper()
        content = chunk.get("text", "").strip()
        lines.append(f"[{idx}] [{domain}] {content}")

    return "\n\n".join(lines)


class ResearchAgent(BaseAgent):
    """
    Domain-aware RAG retrieval + LLM synthesis.
    """

    def build_prompt(
        self,
        state: dict,
        rag_context: str = "",
        web_context: str = "",
    ) -> str:
        """
        Build the research prompt with formatted context strings.

        This method is separated from run() to allow easier testing and
        inspection of the prompt before LLM invocation.
        """
        if not rag_context:
            rag_context = _format_chunks(state.get("retrieved_context", []))
        if not web_context:
            web_context = _format_search_results(state.get("web_search_results", {}))

        return RESEARCH_PROMPT.format(
            query=state["query"],
            planner_output=json.dumps(state.get("planner_output", {}), indent=2),
            shared_missing_information=json.dumps(
                state.get("missing_information", []), indent=2
            ),
            rag_context=rag_context,
            web_context=web_context,
        )

    def run(self, state: dict) -> dict:
        """
        Domain-aware RAG retrieval + LLM invocation.

        Returns a state patch containing:
            outputs["research"]   - the structured agent output dict
            retrieved_context     - the raw chunk list for downstream agents
        """
        query: str = state.get("query", "")
        # Planner-selected agent names drive domain selection
        agent_names: List[str] = state.get("required_agents", [])

        # ── 1. Domain-aware retrieval ─────────────────────────────────────────
        logger.info(
            "[ResearchAgent] Planner selected: %s",
            ", ".join(agent_names) if agent_names else "(none)",
        )
        try:
            chunks = retrieve_domains(agent_names, query)
            try:
                search_results = execute_tool_with_metadata(
                    state,
                    "SearchTool",
                    "Research",
                    SearchTool.search,
                    SearchInput(
                        query=query,
                        max_results=5,
                    )
                )
            except Exception as exc:
                logger.warning(
                    "[ResearchAgent] Web search failed: %s",
                    exc,
                )
                search_results = {
                    "success": False,
                    "results": [],
                }
        except Exception as exc:
            logger.warning(
                "[ResearchAgent] Retrieval failed: %s. Continuing without context.", exc
            )
            chunks = []

        # ── 2. Format for prompt ──────────────────────────────────────────────
        rag_context = _format_chunks(chunks)
        web_context = _format_search_results(
            search_results
        )
        # ── 3. Build prompt and call LLM ──────────────────────────────────────
        prompt = self.build_prompt(state, rag_context=rag_context, web_context=web_context)

        try:
            response = self.invoke_llm(prompt)
            content = response.content.strip()

            logger.debug("[ResearchAgent] RAW OUTPUT:\n%s", content)

            content = re.sub(r"^```json\s*", "", content, flags=re.IGNORECASE)
            content = re.sub(r"^```\s*", "", content)
            content = re.sub(r"\s*```$", "", content)

            match = re.search(r"\{.*\}", content, re.DOTALL)
            if not match:
                raise json.JSONDecodeError("No JSON object found", content, 0)

            json_text = repair_json(match.group(0))
            result: dict = json.loads(json_text)

            # ── 4. Populate references if LLM returned none ───────────────────
            if not result.get("references"):
                result["references"] = build_references_from_chunks(chunks)

            result["confidence_score"] = calculate_confidence(result)

            logger.info(
                "[ResearchAgent] Completed — status: %s | chunks: %d | references: %d",
                result.get("status", "?"),
                len(chunks),
                len(result.get("references", [])),
            )

        except json.JSONDecodeError as exc:
            logger.error("ResearchAgent returned invalid JSON.\n%s", content)
            result = fallback_response("research", str(exc))

        except Exception as exc:
            logger.exception("ResearchAgent failed after all retry attempts.")
            result = fallback_response("research", str(exc))

        # ── 5. Return state patch ─────────────────────────────────────────────
        return {
            "outputs": {
                **state.get("outputs", {}),
                "research": result,
            },
            "retrieved_context": chunks,
            "web_search_results": search_results,
        }
