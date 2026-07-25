import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, Database, Clock, Bot, Loader2 } from "lucide-react";

import { PageHeader, Panel, StatCard } from "@/components/ui-parts";
import { analyticsService, AnalyticsResponse } from "@/services";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · EarthMind AI" },
      { name: "description", content: "Forecasts and decompositions across your sustainability signal." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await analyticsService.getAnalytics();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Build chart data from the real API's daily bucket
  const queriesData = (data?.daily.queries_per_period ?? []).map((p) => ({
    date: new Date(p.date).toLocaleDateString("default", { month: "short", day: "numeric" }),
    queries: p.value,
  }));

  const reportsData = (data?.daily.reports_generated_per_period ?? []).map((p) => ({
    date: new Date(p.date).toLocaleDateString("default", { month: "short", day: "numeric" }),
    reports: p.value,
  }));

  const docsData = Object.entries(data?.documents_per_domain ?? {}).map(([domain, count]) => ({
    domain,
    documents: count,
  }));

  const chunksData = Object.entries(data?.chunks_per_domain ?? {}).map(([domain, count]) => ({
    domain,
    chunks: count,
  }));

  const agentStats = Object.entries(data?.agent_statistics ?? {});

  // Summary KPIs
  const totalQueries = (data?.daily.queries_per_period ?? []).reduce((s, p) => s + p.value, 0);
  const totalReports = (data?.daily.reports_generated_per_period ?? []).reduce((s, p) => s + p.value, 0);
  const totalDocs = Object.values(data?.documents_per_domain ?? {}).reduce((s, v) => s + v, 0);
  const avgExecTime = agentStats.length > 0
    ? (agentStats.reduce((s, [, v]) => s + (v.average_execution_time ?? 0), 0) / agentStats.length).toFixed(2)
    : "0";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Predictive analytics"
        title="Signals, not spreadsheets."
        description="Real-time usage, document growth, and per-agent performance metrics from the EarthMind backend."
      />

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Queries (30d)" value={totalQueries.toString()} icon={TrendingDown} accent="leaf" index={0} />
        <StatCard label="Reports (30d)" value={totalReports.toString()} icon={TrendingDown} accent="ocean" index={1} />
        <StatCard label="Indexed Documents" value={totalDocs.toString()} icon={Database} accent="solar" index={2} />
        <StatCard label="Avg Agent Time" value={avgExecTime} unit="s" icon={Clock} accent="violet" index={3} />
      </div>

      {/* Queries over time */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Queries per day" description="Daily pipeline executions">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={queriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 285 / 0.4)" vertical={false} />
                <XAxis dataKey="date" stroke="oklch(0.5 0.02 285)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.02 285)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(1 0 0)",
                    border: "1px solid oklch(0.92 0.005 285)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="queries"
                  stroke="oklch(0.42 0.22 285)"
                  strokeWidth={2.5}
                  dot={{ fill: "oklch(0.42 0.22 285)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Reports generated per day" description="Daily Markdown reports produced">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 285 / 0.4)" vertical={false} />
                <XAxis dataKey="date" stroke="oklch(0.5 0.02 285)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.02 285)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(1 0 0)",
                    border: "1px solid oklch(0.92 0.005 285)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="reports"
                  stroke="oklch(0.62 0.22 290)"
                  strokeWidth={2.5}
                  dot={{ fill: "oklch(0.62 0.22 290)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Domain breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Documents per domain" description="Knowledge base distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={docsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 285 / 0.4)" vertical={false} />
                <XAxis dataKey="domain" stroke="oklch(0.5 0.02 285)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.02 285)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(1 0 0)",
                    border: "1px solid oklch(0.92 0.005 285)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="documents" fill="oklch(0.55 0.24 285)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Chunks per domain" description="Vector embedding distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chunksData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 285 / 0.4)" vertical={false} />
                <XAxis dataKey="domain" stroke="oklch(0.5 0.02 285)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.02 285)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(1 0 0)",
                    border: "1px solid oklch(0.92 0.005 285)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="chunks" fill="oklch(0.85 0.08 290)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Agent statistics */}
      <Panel title="Agent performance" description="Executions and average processing time per agent">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {agentStats.length === 0 ? (
            <p className="col-span-full text-sm text-muted-foreground">No agent executions recorded yet.</p>
          ) : (
            agentStats.map(([agent, stats]) => (
              <div
                key={agent}
                className="rounded-2xl border border-border/50 bg-white/40 p-4 dark:bg-white/5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-xl bg-primary/10 p-1.5 text-primary">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm font-medium capitalize">{agent}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <p className="uppercase tracking-widest text-[9px]">Executions</p>
                    <p className="mt-1 font-numeric text-base font-medium text-foreground">{stats.executions}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-widest text-[9px]">Avg Time</p>
                    <p className="mt-1 font-numeric text-base font-medium text-foreground">
                      {stats.average_execution_time > 0 ? `${stats.average_execution_time.toFixed(1)}s` : "—"}
                    </p>
                  </div>
                </div>
                {stats.last_run && (
                  <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(stats.last_run).toLocaleString()}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
