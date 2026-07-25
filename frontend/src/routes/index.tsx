import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  TrendingUp,
  Search,
  FileText,
  Database,
  Layers,
  Loader2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getDashboardStats } from "@/services/dashboard.service";
import { analyticsService } from "@/services/analytics.service";
import type { DashboardStatsResponse, QueryHistoryItem, ReportHistoryItem, KnowledgeBaseStats, AnalyticsResponse } from "@/services/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview · EarthMind AI" },
      {
        name: "description",
        content:
          "Build Sustainable Communities with AI — EarthMind AI unites multi-agent intelligence, watsonx.ai and the UN SDGs into a single sustainability operating system.",
      },
      { property: "og:title", content: "EarthMind AI — Sustainability Intelligence" },
      {
        property: "og:description",
        content:
          "Multi-agent orchestration, LangGraph, IBM watsonx.ai and RAG aligned to the UN SDGs.",
      },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [statsData, analyticsData] = await Promise.all([
          getDashboardStats(),
          analyticsService.getAnalytics(),
        ]);
        setStats(statsData);
        setAnalytics(analyticsData);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="rounded-lg bg-red-500/10 p-6 text-center text-red-500">
          <p className="font-medium">Failed to load dashboard</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: "Total Queries",
      value: stats.queries.total.toString(),
      delta: 0,
      icon: Search,
      caption: `${stats.queries.completed} completed, ${stats.queries.failed} failed`,
    },
    {
      label: "Total Reports",
      value: stats.reports.total.toString(),
      delta: 0,
      icon: FileText,
      caption: "Generated reports",
    },
    {
      label: "Total Indexed Documents",
      value: stats.knowledge_base.total_documents.toString(),
      delta: 0,
      icon: Database,
      caption: "Across all domains",
    },
    {
      label: "Total Chunks",
      value: stats.knowledge_base.total_chunks.toString(),
      delta: 0,
      icon: Layers,
      caption: "Vector embeddings",
    },
  ];

  return (
    <div className="relative mx-auto flex max-w-7xl flex-col gap-10 pb-16">
      <AnimatedBackdrop />

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative pt-10"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-electric/25 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-sm dark:bg-white/5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Multi-agent orchestration is live
        </div>

        <h1 className="max-w-4xl text-balance font-display text-5xl leading-[1.02] tracking-[-0.03em] sm:text-6xl md:text-7xl">
          Build{" "}
          <span
            className="italic"
            style={{
              backgroundImage: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            Sustainable
          </span>{" "}
          Communities with AI
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-[17px]">
          EarthMind AI combines multi-agent intelligence, LangGraph orchestration,
          IBM watsonx.ai, RAG and sustainability analytics to generate intelligent
          action plans aligned with the UN Sustainable Development Goals.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button
            asChild
            size="lg"
            className="group h-11 rounded-full bg-gradient-to-r from-[oklch(0.42_0.22_285)] to-[oklch(0.62_0.22_290)] px-5 text-sm font-medium text-white shadow-[0_10px_30px_-8px_oklch(0.42_0.22_285/0.55)] hover:shadow-[0_16px_40px_-8px_oklch(0.42_0.22_285/0.6)]"
          >
            <Link to="/plan">
              <Sparkles className="mr-2 h-4 w-4" />
              New Sustainability Plan
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-11 rounded-full border-border/70 bg-white/60 px-5 text-sm font-medium backdrop-blur-sm dark:bg-white/5"
          >
            <Link to="/agents">
              View live agents
            </Link>
          </Button>
        </div>
      </motion.section>

      {/* KPI CARDS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <KpiCard key={k.label} {...k} index={i} />
        ))}
      </section>

      {/* CHART + ACTIVITY */}
      <section className="grid gap-4 lg:grid-cols-3">
        <PipelineActivityChart analytics={analytics} />
        <ActivityStream queries={stats.recent_queries} reports={stats.recent_reports} />
      </section>

      {/* KNOWLEDGE BASE */}
      <section className="grid gap-4 lg:grid-cols-1">
        <KnowledgeBaseSection stats={stats.knowledge_base} />
      </section>
    </div>
  );
}

/* ---------- Animated backdrop ---------- */
function AnimatedBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-[720px] overflow-hidden"
    >
      <div
        className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.65 0.22 290 / 0.35), transparent 70%)",
          animation: "aurora-drift 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-32 top-24 h-[480px] w-[480px] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.42 0.22 285 / 0.35), transparent 70%)",
          animation: "aurora-drift-2 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-1/3 top-48 h-[380px] w-[380px] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.85 0.08 290 / 0.55), transparent 70%)",
          animation: "aurora-drift 26s ease-in-out infinite reverse",
        }}
      />
      <div className="grid-lines absolute inset-0 opacity-[0.15]" />
    </div>
  );
}

/* ---------- KPI card ---------- */
function KpiCard({
  label,
  value,
  unit,
  delta,
  icon: Icon,
  caption,
  index = 0,
  invertColors = false,
}: {
  label: string;
  value: string;
  unit?: string;
  delta: number;
  icon: any;
  caption?: string;
  index?: number;
  invertColors?: boolean;
}) {
  const rawPositive = delta >= 0;
  const isGood = invertColors ? !rawPositive : rawPositive;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="glass group relative overflow-hidden rounded-2xl p-5 transition-shadow hover:shadow-[0_20px_50px_-20px_oklch(0.42_0.22_285/0.25)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-transparent opacity-60 blur-2xl transition-opacity group-hover:opacity-100"
      />
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <div className="rounded-xl border border-border/60 bg-white/70 p-1.5 text-primary dark:bg-white/5">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="font-numeric text-4xl font-medium tracking-tight text-foreground">
          {value}
        </span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-numeric text-[11px] font-medium",
            isGood
              ? "bg-[color:var(--success)]/12 text-[color:var(--success)]"
              : "bg-[color:var(--error)]/10 text-[color:var(--error)]",
          )}
        >
          {rawPositive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {Math.abs(delta)}%
        </span>
        {caption && (
          <span className="text-[11px] text-muted-foreground">{caption}</span>
        )}
      </div>
    </motion.div>
  );
}

/* ---------- Pipeline Activity chart ---------- */
function PipelineActivityChart({ analytics }: { analytics: AnalyticsResponse | null }) {
  // Combine queries and reports into one chart
  const data = (analytics?.daily.queries_per_period ?? []).map((q, i) => {
    const r = analytics?.daily.reports_generated_per_period[i];
    return {
      date: new Date(q.date).toLocaleDateString("default", { month: "short", day: "numeric" }),
      queries: q.value,
      reports: r ? r.value : 0,
    };
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2 }}
      className="glass rounded-2xl p-6 lg:col-span-2"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-display text-2xl font-medium tracking-tight">
              Pipeline Activity
            </h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Daily executions & generated reports
          </p>
        </div>
        <div className="hidden items-center gap-3 text-[11px] font-medium text-muted-foreground sm:flex">
          {[
            { c: "oklch(0.42 0.22 285)", l: "Queries" },
            { c: "oklch(0.62 0.22 290)", l: "Reports" },
          ].map((x) => (
            <span key={x.l} className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: x.c }}
              />
              {x.l}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient id="s1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.42 0.22 285)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="oklch(0.42 0.22 285)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="s2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.62 0.22 290)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="oklch(0.62 0.22 290)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 4"
              stroke="oklch(0.5 0.02 285 / 0.18)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="oklch(0.5 0.02 285)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="oklch(0.5 0.02 285)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ stroke: "oklch(0.55 0.24 285 / 0.25)", strokeWidth: 1 }}
              contentStyle={{
                background: "oklch(1 0 0 / 0.95)",
                border: "1px solid oklch(0.92 0.005 285)",
                borderRadius: 14,
                fontSize: 12,
                boxShadow: "0 10px 30px -10px oklch(0.42 0.22 285 / 0.25)",
              }}
            />
            <Area
              type="monotone"
              dataKey="reports"
              stackId="2"
              stroke="oklch(0.62 0.22 290)"
              fill="url(#s2)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="queries"
              stackId="1"
              stroke="oklch(0.42 0.22 285)"
              fill="url(#s1)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

/* ---------- Activity ---------- */
const severityStyles: Record<string, string> = {
  success: "text-[color:var(--success)] bg-[color:var(--success)]/10",
  info: "text-primary bg-primary/10",
  warning: "text-[color:var(--warning)] bg-[color:var(--warning)]/12",
  completed: "text-[color:var(--success)] bg-[color:var(--success)]/10",
  processing: "text-primary bg-primary/10",
  failed: "text-[color:var(--error)] bg-[color:var(--error)]/12",
};

function ActivityStream({ queries, reports }: { queries: QueryHistoryItem[], reports: ReportHistoryItem[] }) {
  const items = [
    ...queries.map((q) => ({
      id: q.id,
      title: q.query,
      type: "Query",
      time: new Date(q.created_at),
      status: q.status,
    })),
    ...reports.map((r) => ({
      id: r.id,
      title: r.original_query || "Generated Report",
      type: "Report",
      time: new Date(r.created_at),
      status: r.status,
    })),
  ].sort((a, b) => b.time.getTime() - a.time.getTime());

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.28 }}
      className="glass flex flex-col rounded-2xl p-6 h-full max-h-[400px] overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-medium tracking-tight">
            Recent Activity
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Latest queries and reports
          </p>
        </div>
      </div>
      <div className="mt-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <ul className="space-y-4">
            {items.map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-medium",
                    severityStyles[a.status] || severityStyles.info,
                  )}
                >
                  {a.type.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm leading-snug truncate" title={a.title}>
                    <span className="font-medium">{a.type}</span>{" "}
                    <span className="text-muted-foreground">{a.title}</span>
                  </p>
                  <p className="mt-0.5 font-numeric text-[11px] text-muted-foreground flex gap-2">
                    <span>{a.time.toLocaleString()}</span>
                    <span className="capitalize opacity-80 border-l border-border pl-2">{a.status}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.section>
  );
}

/* ---------- Knowledge Base ---------- */
function KnowledgeBaseSection({ stats }: { stats: KnowledgeBaseStats }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.3 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="font-display text-2xl font-medium tracking-tight">
            Knowledge Base
          </h3>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Documents</p>
            <p className="font-numeric text-lg font-medium">{stats.total_documents}</p>
          </div>
          <div className="text-right border-l border-border/50 pl-4">
            <p className="text-xs text-muted-foreground">Total Chunks</p>
            <p className="font-numeric text-lg font-medium">{stats.total_chunks}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.domains.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full">No domains indexed yet.</p>
        ) : (
          stats.domains.map((domain) => (
            <div
              key={domain.domain}
              className="rounded-xl border border-border/60 bg-white/40 p-4 transition-colors hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <p className="text-sm font-medium capitalize">{domain.domain}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><FileText className="h-3 w-3" /> {domain.documents}</span>
                <span className="flex items-center gap-1.5"><Layers className="h-3 w-3" /> {domain.chunks}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.section>
  );
}
