/**
 * services/dashboard.service.ts
 *
 * Wraps the dashboard statistics endpoint:
 *   GET /api/v1/dashboard/stats
 */

import { get } from "./api";
import type { DashboardStatsResponse } from "./types";

/**
 * Fetch all metrics and recent history for the main dashboard.
 */
export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  return get<DashboardStatsResponse>("/api/v1/dashboard/stats");
}
