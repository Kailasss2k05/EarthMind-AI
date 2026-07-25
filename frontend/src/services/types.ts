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
  /** Always "completed" on the happy path, "partial" if some agents errored */
  status: "completed" | "partial" | string;
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
  /** Deduplicated list of information gaps across all agents, each with type and description */
  missing_information: { type: string; description: string }[];
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
  id: string;
  filename: string;
  domain: string;
  size: number;
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

// ─── REST: Knowledge Base ──────────────────────────────────────────────────

export interface KnowledgeBaseResponse {
  total_documents: number;
  total_chunks: number;
  collections: DomainStats[];
  recent_uploads: RecentUpload[];
}

// ─── REST: Documents ───────────────────────────────────────────────────────

export interface DocumentItem {
  id: string;
  filename: string;
  domain: string;
  chunks: number;
  size: number;
  uploaded_at: string | null;
}

export interface DocumentListResponse {
  items: DocumentItem[];
}

// ─── REST: Reports ─────────────────────────────────────────────────────────

export interface ReportHistoryItemEnhanced {
  id: string;
  query_id: string;
  original_query: string;
  status: string;
  title: string;
  summary: string;
  created_at: string;
}

export interface ReportHistoryListResponse {
  total: number;
  items: ReportHistoryItemEnhanced[];
}

/** GET /api/v1/reports/{id} — full report detail */
export interface ReportDetailResponse {
  id: string;
  query_id: string;
  original_query: string;
  report: string; // Full Markdown report text
  planner_output: Record<string, unknown> | null;
  execution_time: number;
  confidence: number | null;
  status: string;
  created_at: string;
}


// ─── REST: History ─────────────────────────────────────────────────────────

export interface HistoryItem {
  id: string;
  type: string;
  status: string;
  created_at: string;
  title: string;
  summary: string;
}

export interface HistoryListResponse {
  total: number;
  items: HistoryItem[];
}

// ─── REST: Analytics ───────────────────────────────────────────────────────

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

export interface AgentStats {
  executions: number;
  last_run: string | null;
  average_execution_time: number;
  /** If true, these counts are heuristic estimates, not ground-truth per-agent logs */
  estimated?: boolean;
}

export interface AnalyticsTimeBucket {
  queries_per_period: TimeSeriesDataPoint[];
  reports_generated_per_period: TimeSeriesDataPoint[];
  documents_uploaded_per_period: TimeSeriesDataPoint[];
  knowledge_growth_per_period: TimeSeriesDataPoint[];
}

export interface AnalyticsResponse {
  daily: AnalyticsTimeBucket;
  weekly: AnalyticsTimeBucket;
  monthly: AnalyticsTimeBucket;
  documents_per_domain: Record<string, number>;
  chunks_per_domain: Record<string, number>;
  agent_statistics: Record<string, AgentStats>;
}

// ─── REST: Settings ────────────────────────────────────────────────────────

export interface SettingsConfigured {
  postgres: boolean;
  chromadb: boolean;
  redis: boolean;
  watsonx: boolean;
}

export interface SettingsResponse {
  organisation: string;
  region: string;
  notification_defaults: Record<string, boolean>;
  configured: SettingsConfigured;
}

// ─── REST: System Status ───────────────────────────────────────────────────

export interface ServiceConnection {
  connected: boolean;
}

export interface OllamaConfig {
  configured: boolean;
}

export interface SystemServices {
  postgres: ServiceConnection;
  redis: ServiceConnection;
  chromadb: ServiceConnection;
  ollama: OllamaConfig;  // renamed from watsonx — actual LLM is Ollama
}

export interface SystemStatusResponse {
  services: SystemServices;
  documents: number;
  chunks: number;
  knowledge_base: number;
  agents: number;
  embedding_model: string;
}

// ─── REST: Agents Status ───────────────────────────────────────────────────

export interface AgentStatusDetail {
  status: string;
  executions: number;
  last_run: string | null;
  average_execution_time: number;
  /** If true, counts are heuristic estimates — no per-agent DB log exists */
  estimated?: boolean;
}

export interface AgentStatusResponse {
  planner: AgentStatusDetail;
  research: AgentStatusDetail;
  policy: AgentStatusDetail;
  environmental: AgentStatusDetail;
  finance: AgentStatusDetail;
  risk: AgentStatusDetail;
  timeline: AgentStatusDetail;
  report: AgentStatusDetail;
  sdg: AgentStatusDetail;
}

