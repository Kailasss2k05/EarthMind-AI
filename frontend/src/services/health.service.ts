/**
 * services/health.service.ts
 *
 * Wraps the backend health check endpoint:
 *   GET /api/v1/health
 *
 * Backend source: app/api/routes/health.py
 *
 * The health endpoint checks four infrastructure services and returns:
 *   {
 *     "status": "healthy" | "unhealthy",
 *     "services": {
 *       "postgres": "connected" | "disconnected",
 *       "redis":    "connected" | "disconnected",
 *       "ollama":   "connected" | "disconnected",
 *       "chromadb": "connected" | "disconnected"
 *     }
 *   }
 *
 * Use this to power status indicators in the UI (e.g. Knowledge Base page,
 * dashboard). Suitable for polling every 30–60 seconds.
 */

import { get } from "./api";
import type { HealthResponse } from "./types";

/**
 * Fetch current backend infrastructure health.
 *
 * @returns HealthResponse with overall status and per-service connectivity
 * @throws {EarthMindApiError} on server error
 * @throws {TypeError}          on network failure (backend offline)
 */
export async function getHealth(): Promise<HealthResponse> {
  return get<HealthResponse>("/api/v1/health");
}
