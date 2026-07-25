import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Cpu,
  Clock,
  Compass,
  Search,
  Target,
  Scale,
  Leaf,
  Wallet,
  ShieldAlert,
  CalendarClock,
  FileText,
  Loader2,
} from "lucide-react";

import { PageHeader, Panel } from "@/components/ui-parts";
import { Badge } from "@/components/ui/badge";
import { agentService, AgentStatusResponse, AgentStatusDetail } from "@/services";
import type { ComponentType } from "react";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agents · EarthMind AI" },
      { name: "description", content: "Manage the LangGraph multi-agent runtime powering EarthMind." },
    ],
  }),
  component: AgentsPage,
});

// Metadata for display — maps API agent keys to icon + description
const AGENT_META: Record<string, {
  displayName: string;
  role: string;
  icon: ComponentType<{ className?: string }>;
}> = {
  planner: {
    displayName: "Planner",
    role: "Routes queries to the correct specialist agents",
    icon: Compass,
  },
  research: {
    displayName: "Research",
    role: "RAG retrieval over the ChromaDB knowledge base",
    icon: Search,
  },
  sdg: {
    displayName: "SDG Analyst",
    role: "Aligns findings with UN Sustainable Development Goals",
    icon: Target,
  },
  policy: {
    displayName: "Policy Analyst",
    role: "Cross-checks municipal and international policy",
    icon: Scale,
  },
  environmental: {
    displayName: "Environmental",
    role: "Models environmental impact and co-benefits",
    icon: Leaf,
  },
  finance: {
    displayName: "Finance Analyst",
    role: "Estimates CAPEX, OPEX and funding pathways",
    icon: Wallet,
  },
  risk: {
    displayName: "Risk Analyst",
    role: "Surfaces implementation and climate risks",
    icon: ShieldAlert,
  },
  timeline: {
    displayName: "Timeline Planner",
    role: "Sequences milestones and dependencies",
    icon: CalendarClock,
  },
  report: {
    displayName: "Report Writer",
    role: "Synthesises the final Markdown plan",
    icon: FileText,
  },
};

function statusBadgeClass(executions: number) {
  if (executions === 0) return "bg-muted text-muted-foreground";
  return "bg-[oklch(0.65_0.22_290)]/15 text-[oklch(0.42_0.22_285)]";
}

function AgentCard({
  agentKey,
  stats,
  index,
}: {
  agentKey: string;
  stats: AgentStatusDetail;
  index: number;
}) {
  const meta = AGENT_META[agentKey] ?? {
    displayName: agentKey,
    role: "Specialist agent",
    icon: Bot,
  };
  const Icon = meta.icon;
  const isActive = stats.executions > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="glass group relative overflow-hidden rounded-3xl p-5"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-2xl" />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-transparent p-2.5">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg leading-tight">{meta.displayName}</h3>
            <p className="text-xs text-muted-foreground">{meta.role}</p>
          </div>
        </div>
        <Badge className={`rounded-full ${statusBadgeClass(stats.executions)} hover:opacity-90`}>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />
          {isActive ? "active" : "idle"}
        </Badge>
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
        <Cpu className="h-3.5 w-3.5" />
        ollama · {agentKey === "report" ? "text-mode" : "json-mode"}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border/50 p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Executions</p>
          <p className="mt-1 font-display text-xl">{stats.executions.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-border/50 p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Avg Time</p>
          <p className="mt-1 font-display text-xl">
            {stats.average_execution_time > 0
              ? `${stats.average_execution_time.toFixed(1)}s`
              : "—"}
          </p>
        </div>
      </div>

      {stats.last_run && (
        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          Last run: {new Date(stats.last_run).toLocaleString()}
        </div>
      )}
    </motion.div>
  );
}

function AgentsPage() {
  const [agentData, setAgentData] = useState<AgentStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await agentService.getAgentStatus();
        setAgentData(res);
      } catch (err) {
        console.error("Failed to load agent status", err);
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

  const agents = agentData
    ? Object.entries(agentData).map(([key, stats], i) => ({ key, stats, index: i }))
    : [];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="LangGraph runtime"
        title="Your council of specialists."
        description="Each agent runs as a node in the LangGraph DAG with knowledge in ChromaDB — orchestrated via Ollama."
      />

      {agents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No agent data available yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map(({ key, stats, index }) => (
            <AgentCard key={key} agentKey={key} stats={stats} index={index} />
          ))}
        </div>
      )}

      <Panel title="Orchestration graph" description="LangGraph DAG — planner routes to domain agents in dependency order">
        <div className="relative h-80 overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-[oklch(0.62_0.18_275)]/8">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 320" preserveAspectRatio="none">
            <defs>
              <linearGradient id="edge" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="oklch(0.55 0.24 285)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="oklch(0.62 0.18 275)" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            {([
              [80, 160, 260, 160],
              [260, 160, 480, 45],
              [260, 160, 480, 90],
              [260, 160, 480, 135],
              [260, 160, 480, 180],
              [260, 160, 480, 225],
              [260, 160, 480, 270],
              [480, 45, 720, 160],
              [480, 90, 720, 160],
              [480, 135, 720, 160],
              [480, 180, 720, 160],
              [480, 225, 720, 160],
              [480, 270, 720, 160],
            ] as [number, number, number, number][]).map(([x1, y1, x2, y2], i) => (
              <motion.line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#edge)"
                strokeWidth="1.5"
                strokeDasharray="5 5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.05 * i, duration: 0.5 }}
              />
            ))}
          </svg>
          {[
            { x: 80, y: 160, label: "Planner" },
            { x: 260, y: 160, label: "Research" },
            { x: 480, y: 45, label: "SDG" },
            { x: 480, y: 90, label: "Policy" },
            { x: 480, y: 135, label: "Environmental" },
            { x: 480, y: 180, label: "Finance" },
            { x: 480, y: 225, label: "Risk" },
            { x: 480, y: 270, label: "Timeline" },
            { x: 720, y: 160, label: "Report" },
          ].map((n, i) => (
            <motion.div
              key={n.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05 * i, type: "spring", stiffness: 180 }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(n.x / 800) * 100}%`, top: `${(n.y / 320) * 100}%` }}
            >
              <div className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs shadow-[0_8px_24px_-8px_oklch(0.42_0.22_285/0.4)]">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {n.label}
              </div>
            </motion.div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
