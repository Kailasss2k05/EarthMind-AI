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
} from "lucide-react";

import { PageHeader, Panel } from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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

type AgentStatus = "done" | "running" | "queued" | "error";

const agents: {
  id: string;
  name: string;
  icon: typeof Compass;
  desc: string;
  status: AgentStatus;
  progress: number;
  time: string;
  confidence: number;
}[] = [
  { id: "planner", name: "Planner", icon: Compass, desc: "Decomposes the challenge into an executable graph", status: "done", progress: 100, time: "4.2s", confidence: 96 },
  { id: "research", name: "Research", icon: Search, desc: "Gathers evidence via RAG over the knowledge base", status: "done", progress: 100, time: "8.7s", confidence: 94 },
  { id: "sdg", name: "SDG", icon: Target, desc: "Aligns actions with UN Sustainable Development Goals", status: "running", progress: 68, time: "6.1s", confidence: 91 },
  { id: "policy", name: "Policy", icon: Scale, desc: "Cross-checks municipal and international policy", status: "running", progress: 42, time: "3.4s", confidence: 88 },
  { id: "environmental", name: "Environmental", icon: Leaf, desc: "Models environmental impact and co-benefits", status: "queued", progress: 0, time: "—", confidence: 0 },
  { id: "finance", name: "Finance", icon: Wallet, desc: "Estimates CAPEX, OPEX and funding pathways", status: "queued", progress: 0, time: "—", confidence: 0 },
  { id: "risk", name: "Risk", icon: ShieldAlert, desc: "Surfaces implementation and climate risks", status: "queued", progress: 0, time: "—", confidence: 0 },
  { id: "timeline", name: "Timeline", icon: CalendarClock, desc: "Sequences milestones and dependencies", status: "queued", progress: 0, time: "—", confidence: 0 },
  { id: "report", name: "Report", icon: FileText, desc: "Synthesises the final plan and disclosures", status: "queued", progress: 0, time: "—", confidence: 0 },
];

const events = [
  { t: "12:04:22", agent: "Planner", msg: "Graph compiled · 9 nodes, 14 edges", tone: "info" },
  { t: "12:04:26", agent: "Research", msg: "Retrieved 42 chunks from Knowledge Base", tone: "info" },
  { t: "12:04:34", agent: "Research", msg: "Cross-referenced 3 municipality datasets", tone: "success" },
  { t: "12:04:41", agent: "SDG", msg: "Mapping actions to SDG 6, 11, 13…", tone: "info" },
  { t: "12:04:47", agent: "Policy", msg: "EU Green Deal · 4 relevant articles", tone: "info" },
];

const statusStyles: Record<AgentStatus, { ring: string; badge: string; label: string; Icon: typeof CheckCircle2 }> = {
  done: { ring: "text-[oklch(0.72_0.16_160)]", badge: "bg-[oklch(0.72_0.16_160)]/12 text-[oklch(0.55_0.16_160)]", label: "Complete", Icon: CheckCircle2 },
  running: { ring: "text-primary", badge: "bg-primary/12 text-primary", label: "Running", Icon: Loader2 },
  queued: { ring: "text-muted-foreground/50", badge: "bg-muted text-muted-foreground", label: "Queued", Icon: Circle },
  error: { ring: "text-destructive", badge: "bg-destructive/10 text-destructive", label: "Error", Icon: Circle },
};

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
          className={cn("transition-all", s.ring)}
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

function ExecutionPage() {
  const done = agents.filter((a) => a.status === "done").length;
  const overall = Math.round(agents.reduce((s, a) => s + a.progress, 0) / agents.length);
  const active = agents.find((a) => a.status === "running");

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="LangGraph runtime"
        title="Agent Execution"
        description="A live view of your multi-agent pipeline — each node streams state, logs and confidence as it runs."
        actions={
          <>
            <Button variant="outline" className="rounded-full">Pause</Button>
            <Button className="rounded-full bg-gradient-to-r from-[oklch(0.42_0.22_285)] to-[oklch(0.55_0.24_285)] text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.42_0.22_285/0.7)]">
              <Radio className="mr-1.5 h-4 w-4" /> Streaming
            </Button>
          </>
        }
      />

      <Panel className="overflow-hidden">
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Overall progress
            </p>
            <p className="mt-2 font-display text-4xl tracking-tight">
              <span className="font-numeric">{overall}%</span>
              <span className="ml-2 text-base text-muted-foreground">{done} / {agents.length} agents</span>
            </p>
            <Progress value={overall} className="mt-4 h-2" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Currently active
            </p>
            <div className="mt-2 flex items-center gap-3">
              {active && <active.icon className="h-5 w-5 text-primary" />}
              <span className="font-display text-2xl">{active?.name ?? "Idle"}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {active ? active.desc : "All agents standing by."}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Estimated remaining
            </p>
            <p className="mt-2 flex items-center gap-2 font-display text-2xl">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-numeric">42s</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Based on rolling 5-run median.
            </p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {agents.map((a, i) => {
            const s = statusStyles[a.status];
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="glass group relative overflow-hidden rounded-3xl p-4"
              >
                {a.status === "running" && (
                  <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-primary/40" />
                )}
                <div className="flex items-start gap-4">
                  <Ring value={a.progress} status={a.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <a.icon className="h-4 w-4 text-primary" />
                        <h4 className="font-display text-base tracking-tight">{a.name}</h4>
                      </div>
                      <Badge className={cn("rounded-full text-[10px]", s.badge)}>
                        <s.Icon className={cn("mr-1 h-3 w-3", a.status === "running" && "animate-spin")} />
                        {s.label}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.desc}</p>
                    <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
                      <span className="font-numeric">{a.time}</span>
                      <span>·</span>
                      <span className="font-numeric">{a.confidence ? `${a.confidence}% conf` : "—"}</span>
                    </div>
                    <div className="mt-3 flex gap-1.5">
                      <Button size="sm" variant="ghost" className="h-7 rounded-full px-3 text-[11px]">Logs</Button>
                      <Button size="sm" variant="ghost" className="h-7 rounded-full px-3 text-[11px]">Output</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Execution timeline" description="Sequential state transitions">
            <ol className="relative space-y-4 pl-5">
              <span className="absolute left-1.5 top-1 bottom-1 w-px bg-border" />
              {agents.map((a) => (
                <li key={a.id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background",
                      a.status === "done" && "bg-[oklch(0.72_0.16_160)]",
                      a.status === "running" && "bg-primary animate-pulse",
                      a.status === "queued" && "bg-muted-foreground/30",
                    )}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{a.name}</span>
                    <span className="font-numeric text-xs text-muted-foreground">{a.time}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel title="Live event feed" description="Streaming from LangGraph">
            <div className="space-y-3">
              {events.map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 rounded-2xl border border-border/50 p-3"
                >
                  <Activity className="mt-0.5 h-3.5 w-3.5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-numeric">{e.t}</span>
                      <span>·</span>
                      <span className="font-medium text-foreground">{e.agent}</span>
                    </div>
                    <p className="mt-0.5 text-sm">{e.msg}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
