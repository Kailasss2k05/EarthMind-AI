/**
 * routes/execution.tsx
 *
 * Live Agent Execution page.
 *
 * WebSocket integration:
 *   Connects to ws://localhost:8000/api/v1/ws via useAgentWebSocket().
 *   Agent cards are driven by the server-sent events:
 *     - agent_started   → status = "running"
 *     - agent_completed → status = "done"
 *     - agent_failed    → status = "error"
 *
 * The 9 agents in pipeline order (from orchestrator/nodes.py):
 *   Planner → Research → SDG → Policy → Environmental →
 *   Finance → Risk → Timeline → Report
 */

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Compass,
  Search,
  Target,
  Scale,
  Leaf,
  Wallet,
  ShieldAlert,
  CalendarClock,
  FileText,
  Activity,
  Clock,
  CheckCircle2,
  Loader2,
  Circle,
  Radio,
  WifiOff,
  Wifi,
  AlertTriangle,
} from "lucide-react";

import { PageHeader, Panel } from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  useAgentWebSocket,
  PIPELINE_AGENTS,
} from "@/services/websocket.service";
import type { AgentName, AgentStatus } from "@/services/types";
import type { ComponentType } from "react";

export const Route = createFileRoute("/execution")({
  head: () => ({
    meta: [
      { title: "Agent Execution · EarthMind AI" },
      {
        name: "description",
        content:
          "Live LangGraph workflow orchestration across EarthMind's multi-agent runtime.",
      },
    ],
  }),
  component: ExecutionPage,
});

// ─── Agent metadata (icon + description) — display only ──────────────────────

const AGENT_META: Record<
  AgentName,
  { icon: ComponentType<{ className?: string }>; desc: string }
> = {
  Planner: {
    icon: Compass,
    desc: "Decomposes the challenge into an executable graph",
  },
  Research: {
    icon: Search,
    desc: "Gathers evidence via RAG over the knowledge base",
  },
  SDG: {
    icon: Target,
    desc: "Aligns actions with UN Sustainable Development Goals",
  },
  Policy: {
    icon: Scale,
    desc: "Cross-checks municipal and international policy",
  },
  Environmental: {
    icon: Leaf,
    desc: "Models environmental impact and co-benefits",
  },
  Finance: {
    icon: Wallet,
    desc: "Estimates CAPEX, OPEX and funding pathways",
  },
  Risk: {
    icon: ShieldAlert,
    desc: "Surfaces implementation and climate risks",
  },
  Timeline: {
    icon: CalendarClock,
    desc: "Sequences milestones and dependencies",
  },
  Report: {
    icon: FileText,
    desc: "Synthesises the final plan and disclosures",
  },
};

// Progress percentage per status (progress rings are driven by WS events, not fake timers)
const STATUS_PROGRESS: Record<AgentStatus, number> = {
  queued: 0,
  running: 50,   // mid-point while running — no granular progress from backend
  done: 100,
  error: 100,
};

const statusStyles: Record<
  AgentStatus,
  {
    ring: string;
    badge: string;
    label: string;
    Icon: ComponentType<{ className?: string }>;
  }
> = {
  done: {
    ring: "text-[oklch(0.72_0.16_160)]",
    badge: "bg-[oklch(0.72_0.16_160)]/12 text-[oklch(0.55_0.16_160)]",
    label: "Complete",
    Icon: CheckCircle2,
  },
  running: {
    ring: "text-primary",
    badge: "bg-primary/12 text-primary",
    label: "Running",
    Icon: Loader2,
  },
  queued: {
    ring: "text-muted-foreground/50",
    badge: "bg-muted text-muted-foreground",
    label: "Queued",
    Icon: Circle,
  },
  error: {
    ring: "text-destructive",
    badge: "bg-destructive/10 text-destructive",
    label: "Error",
    Icon: Circle,
  },
};

// ─── Ring SVG ─────────────────────────────────────────────────────────────────

function Ring({ value, status }: { value: number; status: AgentStatus }) {
  const c = 2 * Math.PI * 22;
  const s = statusStyles[status];
  return (
    <div className="relative h-14 w-14">
      <svg viewBox="0 0 52 52" className="h-14 w-14 -rotate-90">
        <circle cx="26" cy="26" r="22" strokeWidth="4" className="stroke-border/60" fill="none" />
        <circle
          cx="26"
          cy="26"
          r="22"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          className={cn("transition-all duration-700", s.ring)}
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
        />
      </svg>
      <div className={cn("absolute inset-0 flex items-center justify-center font-numeric text-[11px] font-medium", s.ring)}>
        {status === "queued" ? "—" : `${value}%`}
      </div>
    </div>
  );
}

// ─── Connection status badge ──────────────────────────────────────────────────

function ConnectionBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors",
        connected
          ? "border border-[oklch(0.72_0.16_160)]/30 bg-[oklch(0.72_0.16_160)]/10 text-[oklch(0.55_0.16_160)]"
          : "border border-border bg-muted text-muted-foreground",
      )}
    >
      {connected ? (
        <>
          <Wifi className="h-3 w-3" />
          Connected
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Reconnecting…
        </>
      )}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ExecutionPage() {
  // Real-time agent status from the WebSocket
  const { events, agentStatuses, toolExecutions, isConnected, reset } = useAgentWebSocket();

  // Derived metrics
  const doneCount = agentStatuses.filter((a) => a.status === "done").length;
  const overall = Math.round(
    agentStatuses.reduce((sum, a) => sum + STATUS_PROGRESS[a.status], 0) /
      agentStatuses.length,
  );
  const activeAgent = agentStatuses.find((a) => a.status === "running");

  // Format ISO timestamp to HH:MM:SS
  const formatTime = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleTimeString("en-GB", { hour12: false });
    } catch {
      return "—";
    }
  };

  // Elapsed seconds between startedAt and completedAt (or now)
  const elapsed = (agent: (typeof agentStatuses)[0]) => {
    if (!agent.startedAt) return "—";
    const start = new Date(agent.startedAt).getTime();
    const end = agent.completedAt
      ? new Date(agent.completedAt).getTime()
      : Date.now();
    return `${((end - start) / 1000).toFixed(1)}s`;
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="LangGraph runtime"
        title="Agent Execution"
        description="A live view of your multi-agent pipeline — each node streams state, logs and confidence as it runs."
        actions={
          <>
            <ConnectionBadge connected={isConnected} />
            <Button
              variant="outline"
              className="rounded-full"
              onClick={reset}
              title="Reset agent states"
            >
              Reset
            </Button>
            <Button className="rounded-full bg-gradient-to-r from-[oklch(0.42_0.22_285)] to-[oklch(0.55_0.24_285)] text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.42_0.22_285/0.7)]">
              <Radio className="mr-1.5 h-4 w-4" /> Streaming
            </Button>
          </>
        }
      />

      {/* Summary bar */}
      <Panel className="overflow-hidden">
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Overall progress
            </p>
            <p className="mt-2 font-display text-4xl tracking-tight">
              <span className="font-numeric">{overall}%</span>
              <span className="ml-2 text-base text-muted-foreground">
                {doneCount} / {agentStatuses.length} agents
              </span>
            </p>
            <Progress value={overall} className="mt-4 h-2" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Currently active
            </p>
            <div className="mt-2 flex items-center gap-3">
              {activeAgent && (
                (() => {
                  const meta = AGENT_META[activeAgent.name];
                  return <meta.icon className="h-5 w-5 text-primary" />;
                })()
              )}
              <span className="font-display text-2xl">
                {activeAgent?.name ?? "Idle"}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeAgent
                ? AGENT_META[activeAgent.name].desc
                : isConnected
                ? "Waiting for pipeline to start…"
                : "WebSocket reconnecting…"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              WebSocket status
            </p>
            <p className="mt-2 flex items-center gap-2 font-display text-2xl">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-numeric">{events.length} events</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {isConnected
                ? "Stream open · receiving events"
                : "Attempting reconnect with backoff"}
            </p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* Agent cards — driven by WS events */}
        <div className="grid gap-3 sm:grid-cols-2">
          {agentStatuses.map((agent, i) => {
            const meta = AGENT_META[agent.name];
            const s = statusStyles[agent.status];
            const progress = STATUS_PROGRESS[agent.status];
            return (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="glass group relative overflow-hidden rounded-3xl p-4"
              >
                {agent.status === "running" && (
                  <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-primary/40" />
                )}
                {agent.status === "error" && (
                  <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-destructive/40" />
                )}
                <div className="flex items-start gap-4">
                  <Ring value={progress} status={agent.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <meta.icon className="h-4 w-4 text-primary" />
                        <h4 className="font-display text-base tracking-tight">{agent.name}</h4>
                      </div>
                      <Badge className={cn("rounded-full text-[10px]", s.badge)}>
                        <s.Icon
                          className={cn(
                            "mr-1 h-3 w-3",
                            agent.status === "running" && "animate-spin",
                          )}
                        />
                        {s.label}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {meta.desc}
                    </p>
                    {agent.status === "error" && agent.errorReason && (
                      <p className="mt-1 text-[11px] text-destructive">
                        {agent.errorReason}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
                      <span className="font-numeric">{elapsed(agent)}</span>
                      {agent.startedAt && (
                        <>
                          <span>·</span>
                          <span className="font-numeric">
                            started {formatTime(agent.startedAt)}
                          </span>
                        </>
                      )}
                    </div>

                    {(() => {
                      const tools = toolExecutions.filter((t) => t.agent_name === agent.name);
                      if (!tools || tools.length === 0) return null;
                      return (
                        <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
                          <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                            Tools Executed
                          </div>
                          <div className="grid gap-1.5">
                            {tools.map((t, idx) => {
                              const isDone = t.status === "Completed" || t.status === "completed" || t.status === "success";
                              const isErr = t.status === "Failed" || t.status === "failed" || t.status === "error";
                              const isRun = t.status === "Running" || t.status === "running" || t.status === "Running...";
                              return (
                                <div key={idx} className="flex flex-col gap-0.5 rounded-xl bg-muted/30 border border-border/40 p-2 text-[11px]">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 font-medium">
                                      {isDone && <CheckCircle2 className="h-3 w-3 text-[oklch(0.55_0.16_160)] shrink-0" />}
                                      {isRun && <Loader2 className="h-3 w-3 text-primary animate-spin shrink-0" />}
                                      {isErr && <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />}
                                      {!isDone && !isRun && !isErr && <Circle className="h-3 w-3 text-muted-foreground shrink-0" />}
                                      <span>{t.tool_name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Badge variant="outline" className={cn("text-[9px] px-1 py-0 h-3.5 font-normal",
                                        isDone ? "bg-[oklch(0.72_0.16_160)]/10 text-[oklch(0.55_0.16_160)] border-[oklch(0.72_0.16_160)]/20" :
                                        isErr ? "bg-destructive/10 text-destructive border-destructive/20" :
                                        "bg-primary/10 text-primary border-primary/20"
                                      )}>
                                        {t.status}
                                      </Badge>
                                      {t.execution_time_ms !== undefined && t.execution_time_ms > 0 && (
                                        <span className="font-numeric text-[10px] text-muted-foreground">
                                          {Math.round(t.execution_time_ms)} ms
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {(t.summary || t.error) && (
                                    <p className="text-[10px] text-muted-foreground pl-4 line-clamp-2">
                                      {t.error ? `Error: ${t.error}` : t.summary}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          {/* Execution timeline */}
          <Panel title="Execution timeline" description="Sequential state transitions">
            <ol className="relative space-y-4 pl-5">
              <span className="absolute left-1.5 top-1 bottom-1 w-px bg-border" />
              {PIPELINE_AGENTS.map((name) => {
                const agent = agentStatuses.find((a) => a.name === name);
                const status = agent?.status ?? "queued";
                return (
                  <li key={name} className="relative">
                    <span
                      className={cn(
                        "absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background",
                        status === "done" && "bg-[oklch(0.72_0.16_160)]",
                        status === "running" && "bg-primary animate-pulse",
                        status === "queued" && "bg-muted-foreground/30",
                        status === "error" && "bg-destructive",
                      )}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{name}</span>
                      <span className="font-numeric text-xs text-muted-foreground">
                        {agent ? elapsed(agent) : "—"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>

          {/* Live event feed — real WebSocket messages */}
          <Panel title="Live event feed" description="Streaming from LangGraph">
            <div className="max-h-72 space-y-3 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">
                  {isConnected
                    ? "Waiting for pipeline events…"
                    : "Connecting to WebSocket…"}
                </p>
              ) : (
                [...events].reverse().map((event, i) => {
                  const isAgent =
                    event.type === "agent_started" ||
                    event.type === "agent_completed" ||
                    event.type === "agent_failed";

                  const agentName = isAgent
                    ? (event as { agent: string }).agent
                    : null;
                  const timestamp = isAgent
                    ? formatTime((event as { timestamp: string }).timestamp)
                    : null;

                  const msg =
                    event.type === "connected"
                      ? event.message
                      : event.type === "agent_started"
                      ? `${event.agent} agent started`
                      : event.type === "agent_completed"
                      ? `${event.agent} agent completed`
                      : event.type === "agent_failed"
                      ? `${event.agent} failed — ${event.reason}`
                      : event.type === "tool_started"
                      ? `[Tool] ${event.tool_name} started (${event.agent_name})`
                      : event.type === "tool_completed"
                      ? `[Tool] ${event.tool_name} completed (${event.execution_time_ms}ms)`
                      : event.type === "tool_failed"
                      ? `[Tool] ${event.tool_name} failed — ${event.error || event.summary}`
                      : event.type === "echo"
                      ? `Echo: ${JSON.stringify(event.message)}`
                      : `Event: ${(event as any).type}`;

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex items-start gap-3 rounded-2xl border border-border/50 p-3",
                        (event.type === "agent_failed" || event.type === "tool_failed") &&
                          "border-destructive/30 bg-destructive/5",
                        (event.type === "agent_completed" || event.type === "tool_completed") &&
                          "border-[oklch(0.72_0.16_160)]/20",
                      )}
                    >
                      <Activity
                        className={cn(
                          "mt-0.5 h-3.5 w-3.5 shrink-0",
                          (event.type === "agent_failed" || event.type === "tool_failed")
                            ? "text-destructive"
                            : (event.type === "agent_completed" || event.type === "tool_completed")
                            ? "text-[oklch(0.55_0.16_160)]"
                            : "text-primary",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          {timestamp && (
                            <span className="font-numeric">{timestamp}</span>
                          )}
                          {timestamp && <span>·</span>}
                          {agentName && (
                            <span className="font-medium text-foreground">
                              {agentName}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm">{msg}</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
