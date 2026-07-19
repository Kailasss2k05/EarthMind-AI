/**
 * services/api.ts
 *
 * Base HTTP client for the EarthMind AI FastAPI backend.
 *
 * Backend runs at http://localhost:8000 (configured in backend/.env:
 *   HOST=127.0.0.1, PORT=8000)
 *
 * All API calls go through `apiRequest()` which:
 *   1. Prepends the base URL
 *   2. Sets JSON content-type
 *   3. Parses the response
 *   4. Surfaces the standard error envelope { success, error, status }
 *      returned by backend/app/core/exception_handlers.py
 */

import type { ApiError } from "./types";

// ─── Configuration ────────────────────────────────────────────────────────────

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const WS_BASE_URL: string = API_BASE_URL.replace(/^http/, "ws");


// ─── Error class ──────────────────────────────────────────────────────────────

export class EarthMindApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "EarthMindApiError";
  }
}

// ─── Core request helper ──────────────────────────────────────────────────────

/**
 * Makes a typed fetch request to the EarthMind backend.
 *
 * @throws {EarthMindApiError} when the server returns a non-2xx status
 * @throws {TypeError}         on network failure (no connection)
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers ?? {}),
    },
  });

  // Try to parse the body as JSON regardless of status code,
  // because the backend always returns JSON (even for errors).
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new EarthMindApiError(
      response.status,
      `Non-JSON response from server (HTTP ${response.status})`,
    );
  }

  if (!response.ok) {
    // Backend error envelope: { success: false, error: string, status: number }
    const err = body as Partial<ApiError>;
    throw new EarthMindApiError(
      response.status,
      err.error ?? `Request failed with HTTP ${response.status}`,
    );
  }

  return body as T;
}

/** Convenience: HTTP POST with a JSON body */
export function post<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Convenience: HTTP GET */
export function get<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "GET" });
}
