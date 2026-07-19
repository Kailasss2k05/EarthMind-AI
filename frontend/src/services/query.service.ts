/**
 * services/query.service.ts
 *
 * Wraps the single backend query endpoint:
 *   POST /api/v1/query
 *
 * Backend source: app/api/routes/query.py
 * Schema source:  app/schemas/query.py
 *
 * This is the primary entry point for all multi-agent LangGraph execution.
 * Submitting a query kicks off the full 9-agent pipeline:
 *   Planner → Research → SDG → Policy → Environmental → Finance → Risk → Timeline → Report
 *
 * The HTTP response only contains the planner_output (returned when the full
 * graph completes). Real-time agent progress is streamed separately via
 * the WebSocket endpoint at ws://localhost:8000/api/v1/ws.
 */

import { post } from "./api";
import type { QueryRequest, QueryResponse } from "./types";

/**
 * Submit a sustainability query to the EarthMind multi-agent pipeline.
 *
 * @param query - The sustainability challenge or question (min 1 character)
 * @returns QueryResponse containing request_id, status, and planner_output
 *
 * @throws {EarthMindApiError} - on 4xx/5xx responses
 * @throws {TypeError}          - on network failure
 *
 * @example
 * const result = await submitQuery("How can we reduce urban flooding?");
 * console.log(result.request_id, result.planner_output);
 */
export async function submitQuery(query: string): Promise<QueryResponse> {
  const request: QueryRequest = { query };
  return post<QueryResponse>("/api/v1/query", request);
}
