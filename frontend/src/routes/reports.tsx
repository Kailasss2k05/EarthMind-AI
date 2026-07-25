/**
 * /reports — Lists all generated AI reports and renders individual report details.
 *
 * Two states:
 *   - List view   (default)              → GET /api/v1/reports
 *   - Detail view (?reportId=<uuid>)     → GET /api/v1/reports/{id}
 *
 * The History page "Open" button sets ?reportId=<id> to jump straight to a report.
 */
import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Share2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Calendar,
  Sparkles,
} from "lucide-react";

import { PageHeader, Panel } from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { reportService } from "@/services/report.service";
import type { ReportHistoryItemEnhanced, ReportDetailResponse } from "@/services/types";

// ─── Route definition ───────────────────────────────────────────────────────

export const Route = createFileRoute("/reports")({
  validateSearch: (s: Record<string, unknown>) => ({
    reportId: typeof s.reportId === "string" ? s.reportId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Reports · EarthMind AI" },
      { name: "description", content: "AI-generated multi-agent sustainability reports." },
    ],
  }),
  component: ReportsPage,
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  if (status === "completed")
    return "bg-[oklch(0.72_0.16_160)]/12 text-[oklch(0.55_0.16_160)]";
  if (status === "partial")
    return "bg-[oklch(0.85_0.12_60)]/20 text-[oklch(0.55_0.15_60)]";
  return "bg-muted text-muted-foreground";
}

function StatusIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (status === "partial") return <AlertCircle className="h-3.5 w-3.5" />;
  return <XCircle className="h-3.5 w-3.5" />;
}

/** Render a Markdown string as simple styled HTML without an external library. */
function MarkdownBody({ text }: { text: string }) {
  if (!text) return <p className="text-muted-foreground italic">No report content.</p>;

  const lines = text.split("\n");

  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
      {lines.map((line, i) => {
        if (line.startsWith("# "))
          return <h1 key={i} className="font-display text-3xl font-semibold tracking-tight text-foreground mt-6 first:mt-0">{line.slice(2)}</h1>;
        if (line.startsWith("## "))
          return <h2 key={i} className="font-display text-xl font-semibold tracking-tight text-foreground mt-5">{line.slice(3)}</h2>;
        if (line.startsWith("### "))
          return <h3 key={i} className="font-semibold text-base text-foreground mt-4">{line.slice(4)}</h3>;
        if (line.startsWith("- ") || line.startsWith("* "))
          return <li key={i} className="ml-4 list-disc text-muted-foreground">{line.slice(2)}</li>;
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-muted-foreground">{line.replace(/^\d+\.\s/, "")}</li>;
        if (line.startsWith("---") || line.startsWith("___"))
          return <hr key={i} className="border-border/50 my-4" />;
        if (line.trim() === "")
          return <div key={i} className="h-1" />;
        // Bold **text**
        const formatted = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
        return <p key={i} className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </div>
  );
}

// ─── List View ───────────────────────────────────────────────────────────────

function ReportCard({
  report,
  index,
  onOpen,
}: {
  report: ReportHistoryItemEnhanced;
  index: number;
  onOpen: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="glass group relative rounded-3xl p-6 transition-all hover:shadow-[0_20px_50px_-20px_oklch(0.42_0.22_285/0.3)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-primary/10 p-1.5 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-display text-lg tracking-tight leading-snug">{report.title}</h3>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{report.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(report.created_at).toLocaleString()}
            </span>
            <span className="font-numeric opacity-60">ID {report.id.split("-")[0]}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge className={cn("rounded-full text-xs", statusBadge(report.status))}>
            <StatusIcon status={report.status} />
            <span className="ml-1 capitalize">{report.status}</span>
          </Badge>
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => onOpen(report.id)}
          >
            View report
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ReportListView() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ReportHistoryItemEnhanced[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await reportService.getReports(0, 100, debouncedSearch);
        setItems(res.items);
        setTotal(res.total);
      } catch (e: any) {
        setError(e.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [debouncedSearch]);

  function openReport(id: string) {
    navigate({ to: "/reports", search: { reportId: id } });
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <PageHeader
        eyebrow="AI Reports"
        title="Reports"
        description="Every sustainability plan generated by the multi-agent pipeline — searchable and ready to export."
        actions={
          <Button variant="outline" className="rounded-full">
            <Download className="mr-1.5 h-4 w-4" /> Export all
          </Button>
        }
      />

      <Panel>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reports by query…"
            className="h-11 rounded-full border-border/60 bg-muted/40 pl-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Panel>

      {loading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && !loading && (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm">{error}</p>
          <Button variant="outline" onClick={() => setDebouncedSearch(search)}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-muted-foreground">
          <FileText className="h-10 w-10 opacity-40" />
          <p className="text-sm">
            {debouncedSearch
              ? `No reports found for "${debouncedSearch}"`
              : "No reports yet. Run a query from the New Plan page to generate one."}
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            Showing {items.length} of {total} report{total !== 1 ? "s" : ""}
          </p>
          <div className="flex flex-col gap-4">
            {items.map((r, i) => (
              <ReportCard key={r.id} report={r} index={i} onOpen={openReport} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Detail View ─────────────────────────────────────────────────────────────

function ReportDetailView({ reportId }: { reportId: string }) {
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await reportService.getReportById(reportId);
        setReport(res);
      } catch (e: any) {
        setError(e.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reportId]);

  function goBack() {
    navigate({ to: "/reports", search: { reportId: undefined } });
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm">{error || "Report not found."}</p>
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to reports
        </Button>
      </div>
    );
  }

  // Derive title and subtitle from query
  const title = report.original_query.length > 60
    ? report.original_query.slice(0, 60) + "…"
    : report.original_query;

  const createdDate = new Date(report.created_at).toLocaleString("default", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 rounded-full text-muted-foreground"
          onClick={goBack}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> All reports
        </Button>

        <PageHeader
          eyebrow={`Report · ${createdDate}`}
          title={title}
          description={`Query ID: ${report.query_id.split("-")[0]} · Execution: ${report.execution_time.toFixed(2)}s${report.confidence != null ? ` · Confidence: ${(report.confidence * 100).toFixed(0)}%` : ""}`}
          actions={
            <>
              <Badge className={cn("rounded-full", statusBadge(report.status))}>
                <StatusIcon status={report.status} />
                <span className="ml-1 capitalize">{report.status}</span>
              </Badge>
              <Button variant="outline" className="rounded-full">
                <Share2 className="mr-1.5 h-4 w-4" /> Share
              </Button>
              <Button
                className="rounded-full bg-gradient-to-r from-[oklch(0.42_0.22_285)] to-[oklch(0.55_0.24_285)] text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.42_0.22_285/0.7)]"
                onClick={() => {
                  const blob = new Blob([report.report], { type: "text/markdown" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `report-${report.id.split("-")[0]}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="mr-1.5 h-4 w-4" /> Download MD
              </Button>
            </>
          }
        />
      </motion.div>

      {/* Meta cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Execution time", value: `${report.execution_time.toFixed(2)}s`, icon: Clock },
          { label: "Confidence", value: report.confidence != null ? `${(report.confidence * 100).toFixed(0)}%` : "N/A", icon: Sparkles },
          { label: "Status", value: report.status, icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass rounded-3xl p-5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Icon className="h-3.5 w-3.5" /> {label}
            </div>
            <p className="font-display text-2xl tracking-tight capitalize">{value}</p>
          </div>
        ))}
      </div>

      {/* Report content */}
      <Panel title="Report" description="Full AI-generated sustainability plan">
        <div className="prose-none max-w-none">
          <MarkdownBody text={report.report} />
        </div>
      </Panel>

      {/* Tool Executions */}
      {report.tool_executions && report.tool_executions.length > 0 && (
        <Panel title="Tool Executions" description="Audit log of tools invoked during this query">
          <div className="rounded-2xl border border-border/40 overflow-hidden text-xs font-mono bg-muted/5">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_2.5fr] bg-muted/40 px-4 py-3 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/30">
              <span>Tool Name</span>
              <span>Status</span>
              <span>Timing</span>
              <span>Summary / Result</span>
            </div>
            <div className="divide-y divide-border/30">
              {report.tool_executions.map((tool, idx) => (
                <div key={`${tool.tool_name}-${idx}`} className="grid grid-cols-[1.5fr_1fr_1fr_2.5fr] px-4 py-2.5 items-center hover:bg-muted/10 transition-colors gap-2">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      tool.status === "Completed" ? "bg-emerald-500" :
                      tool.status === "Failed" ? "bg-red-500" : "bg-amber-500"
                    )} />
                    {tool.tool_name}
                    <span className="text-[10px] text-muted-foreground font-normal">({tool.agent_name})</span>
                  </span>
                  <span>
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-semibold uppercase",
                      tool.status === "Completed" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                      tool.status === "Failed" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                      "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    )}>
                      {tool.status}
                    </span>
                  </span>
                  <span className="text-muted-foreground font-numeric">{tool.execution_time_ms ? `${tool.execution_time_ms} ms` : "0 ms"}</span>
                  <span className="text-muted-foreground truncate" title={tool.error || tool.output_summary}>
                    {tool.error ? (
                      <span className="text-red-500 font-semibold">{tool.error}</span>
                    ) : (
                      tool.output_summary
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {/* Original query */}
      <Panel title="Original query" description="The prompt that generated this report">
        <p className="text-sm text-muted-foreground italic">"{report.original_query}"</p>
      </Panel>
    </div>
  );
}

// ─── Root component ──────────────────────────────────────────────────────────

function ReportsPage() {
  const search = useSearch({ from: "/reports" });
  const reportId = (search as { reportId?: string }).reportId;

  if (reportId) {
    return <ReportDetailView reportId={reportId} />;
  }
  return <ReportListView />;
}
