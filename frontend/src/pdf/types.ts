/**
 * src/pdf/types.ts
 *
 * Canonical data shape consumed by both ReportViewer.tsx (web) and
 * ReportDocument.tsx (@react-pdf/renderer).
 *
 * buildReportData() in ReportViewer extracts this from props and passes the
 * same object to the PDF renderer — no duplication of business logic.
 */

// ─── Reference item ───────────────────────────────────────────────────────────

export interface ReferenceItem {
  title: string;
  publisher: string;
  year: string;
  type: string;
  retrievedBy: string;
  url?: string;
  confidence?: string;
  chunk?: string;
}

// ─── Risk entry ────────────────────────────────────────────────────────────────

export interface RiskEntry {
  factor: string;
  likelihood: string; // "Low" | "Medium" | "High" | "Critical"
  mitigation: string;
}

// ─── Financial row ─────────────────────────────────────────────────────────────

export interface FinancialRow {
  label: string;
  value: number; // percentage
  color: string;
}

// ─── Policy recommendation ────────────────────────────────────────────────────

export interface PolicyItem {
  title: string;
  description: string;
}

// ─── Environmental metric ─────────────────────────────────────────────────────

export interface EnvMetric {
  label: string;
  value: string;
  color: string;
}

// ─── Timeline phase ────────────────────────────────────────────────────────────

export interface TimelinePhase {
  phase: string;
  title: string;
  period: string;
}

// ─── Agent log row ─────────────────────────────────────────────────────────────

export interface AgentLogRow {
  name: string;
  status: string;
  duration: string;
  order: string | number;
}

// ─── Tool log row ──────────────────────────────────────────────────────────────

export interface ToolLogRow {
  name: string;
  agent: string;
  status: string;
  duration: string;
  summary: string;
  error?: string | null;
}

// ─── Top-level canonical report data ──────────────────────────────────────────

export interface ReportData {
  // Identity
  reportId: string;
  queryText: string;
  generatedDate: string;  // human-readable date string
  generatedTime: string;  // human-readable time string
  executionDuration: string;

  // Executive summary content
  objectives: string;
  stakeholders: string;

  // Key outcome metrics
  keyOutcomes: { label: string; value: string; desc: string }[];

  // SDG codes that apply (e.g. ["6","9","11","13","15"])
  featuredSdgs: string[];

  // Sections
  policies: PolicyItem[];
  envMetrics: EnvMetric[];
  financialRows: FinancialRow[];
  financialKpis: { label: string; value: string }[];
  risks: RiskEntry[];
  timelinePhases: TimelinePhase[];
  references: ReferenceItem[];
  agentLogRows: AgentLogRow[];
  toolLogRows: ToolLogRow[];

  // Tech metadata
  techInfo: {
    agents: number;
    executionTime: string;
    knowledgeSources: string;
    platform: string;
    llm: string;
    kb: string;
    standard: string;
  };
}

// ─── SDG palette ───────────────────────────────────────────────────────────────

export const SDG_PALETTE: Record<string, { color: string; title: string }> = {
  "1":  { color: "#E5243B", title: "No Poverty" },
  "2":  { color: "#DDA63A", title: "Zero Hunger" },
  "3":  { color: "#4C9F38", title: "Good Health & Wellbeing" },
  "4":  { color: "#C5192D", title: "Quality Education" },
  "5":  { color: "#FF3A21", title: "Gender Equality" },
  "6":  { color: "#26BDE2", title: "Clean Water & Sanitation" },
  "7":  { color: "#FCC30B", title: "Clean Energy" },
  "8":  { color: "#A21942", title: "Decent Work & Economic Growth" },
  "9":  { color: "#FD6925", title: "Industry & Infrastructure" },
  "10": { color: "#DD1367", title: "Reduced Inequalities" },
  "11": { color: "#FD9D24", title: "Sustainable Cities & Communities" },
  "12": { color: "#BF8B2E", title: "Responsible Consumption" },
  "13": { color: "#3F7E44", title: "Climate Action" },
  "14": { color: "#0A97D9", title: "Life Below Water" },
  "15": { color: "#56C02B", title: "Life on Land" },
  "16": { color: "#00689D", title: "Peace & Justice" },
  "17": { color: "#19486A", title: "Partnerships for the Goals" },
};
