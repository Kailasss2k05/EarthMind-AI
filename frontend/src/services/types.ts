/**
 * services/types.ts
 *
 * TypeScript interfaces that mirror the backend Pydantic schemas exactly.
 * Update this file whenever the backend schemas change.
 *
 * Backend sources:
 *   - app/schemas/query.py  → QueryRequest, QueryResponse
 *   - app/api/routes/health.py → HealthResponse
 *   - app/websocket/events.py  → AgentEvent (union type)
 */

// ─── REST: Query ─────────────────────────────────────────────────────────────

/** POST /api/v1/query — request body */
export interface QueryRequest {
  /** The sustainability question or idea to process (min length: 1) */
  query: string;
}

/** POST /api/v1/query — response body */
export interface QueryResponse {
  /** Unique trace ID for this request (UUID string) */
  request_id: string;
  /** Always "completed" on the happy path */
  status: "completed" | string;
  /** Echo of the original query */
  query: string;
  /** Structured plan dict produced by the Planner agent */
  planner_output: Record<string, unknown>;
  /** Final Markdown report produced by the Report agent */
  report: string;
  /** Per-agent structured outputs (excluding "report") */
  outputs: Record<string, unknown>;
  /** Execution status per agent: success | incomplete | failed | skipped */
  agent_status: Record<string, string>;
  /** Error messages for any failed agent */
  errors: Record<string, string>;
  /** Deduplicated list of information gaps across all agents */
  missing_information: string[];
  /** Number of document chunks retrieved during RAG (optional) */
  retrieved_chunks?: number;
  /** Unique ChromaDB domain names searched during retrieval (optional) */
  retrieved_domains?: string[];
}

// ─── REST: Health ─────────────────────────────────────────────────────────────

export type ServiceStatus = "connected" | "disconnected";

export interface HealthServices {
  postgres: ServiceStatus;
  redis: ServiceStatus;
  chromadb: ServiceStatus;
}

/** GET /api/v1/health — response body */
export interface HealthResponse {
  status: "healthy" | "unhealthy";
  services: HealthServices;
}

// ─── Standard error envelope ──────────────────────────────────────────────────

/** Error shape returned by all EarthMind backend exception handlers */
export interface ApiError {
  success: false;
  error: string;
  status: number;
}

// ─── WebSocket event types ────────────────────────────────────────────────────

/** Emitted immediately on successful WebSocket connection */
export interface WsConnectedEvent {
  type: "connected";
  message: string;
}

/**
 * Emitted by agent_executor.py via broadcast_agent_started()
 * immediately BEFORE an agent begins its work.
 */
export interface WsAgentStartedEvent {
  type: "agent_started";
  agent: string;
  timestamp: string; // ISO-8601 UTC
}

/**
 * Emitted by agent_executor.py via broadcast_agent_completed()
 * when an agent finishes successfully.
 */
export interface WsAgentCompletedEvent {
  type: "agent_completed";
  agent: string;
  timestamp: string; // ISO-8601 UTC
}

/**
 * Emitted by agent_executor.py via broadcast_agent_failed()
 * when an agent raises an unhandled exception.
 */
export interface WsAgentFailedEvent {
  type: "agent_failed";
  agent: string;
  reason: string;
  timestamp: string; // ISO-8601 UTC
}

/** Echo response — used for connectivity testing */
export interface WsEchoEvent {
  type: "echo";
  message: unknown;
}

/** Union of all possible server-side WebSocket events */
export type AgentEvent =
  | WsConnectedEvent
  | WsAgentStartedEvent
  | WsAgentCompletedEvent
  | WsAgentFailedEvent
  | WsEchoEvent;

// ─── Agent names (matches LangGraph nodes in orchestrator/nodes.py) ───────────

export type AgentName =
  | "Planner"
  | "Research"
  | "SDG"
  | "Policy"
  | "Environmental"
  | "Finance"
  | "Risk"
  | "Timeline"
  | "Report";

/** The execution status of a single agent derived from WS events */
export type AgentStatus = "queued" | "running" | "done" | "error";

export interface AgentState {
  name: AgentName;
  status: AgentStatus;
  startedAt?: string;
  completedAt?: string;
  errorReason?: string;
}

// ─── REST: History ─────────────────────────────────────────────────────────────

export interface QueryHistoryItem {
  id: string;
  query: string;
  status: string;
  execution_time: number;
  confidence: number | null;
  created_at: string;
}

export interface ReportHistoryItem {
  id: string;
  query_id: string;
  original_query: string;
  status: string;
  created_at: string;
}

// ─── REST: Dashboard ──────────────────────────────────────────────────────────

export interface QueriesStats {
  total: number;
  completed: number;
  failed: number;
  processing: number;
}

export interface ReportsStats {
  total: number;
}

export interface DomainStats {
  domain: string;
  documents: number;
  chunks: number;
}

export interface KnowledgeBaseStats {
  total_documents: number;
  total_chunks: number;
  domains: DomainStats[];
}

export interface RecentUpload {
  filename: string;
  domain: string;
  uploaded_at: string;
}

export interface DashboardStatsResponse {
  generated_at: string;
  queries: QueriesStats;
  reports: ReportsStats;
  knowledge_base: KnowledgeBaseStats;
  recent_queries: QueryHistoryItem[];
  recent_reports: ReportHistoryItem[];
  recent_uploads: RecentUpload[];
}
