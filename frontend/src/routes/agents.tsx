import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bot, Cpu, Play, Pause, Settings2, Sparkles } from "lucide-react";

import { PageHeader, Panel } from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { agents } from "@/lib/mock-data";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agents · EarthMind AI" },
      { name: "description", content: "Manage the LangGraph multi-agent runtime powering EarthMind." },
    ],
  }),
  component: AgentsPage,
});

const statusStyles: Record<string, string> = {
  active: "bg-[oklch(0.65 0.22 290)]/15 text-[oklch(0.42 0.22 285)]",
  idle: "bg-muted text-muted-foreground",
  training: "bg-[oklch(0.85 0.08 290)]/25 text-[oklch(0.55 0.15 290)]",
};

function AgentsPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="LangGraph runtime"
        title="Your council of specialists."
        description="Each agent runs as a graph of tools with memory in PostgreSQL, cache in Redis and knowledge in ChromaDB — orchestrated across watsonx.ai and Ollama."
        actions={
          <Button className="rounded-full bg-gradient-to-r from-[oklch(0.42 0.22 285)] to-[oklch(0.55 0.24 285)] text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.42 0.22 285/0.7)]">
            <Sparkles className="mr-1.5 h-4 w-4" />
            Deploy agent
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="glass group relative overflow-hidden rounded-3xl p-5"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-2xl" />
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-transparent p-2.5">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg leading-tight">{a.name}</h3>
                  <p className="text-xs text-muted-foreground">{a.role}</p>
                </div>
              </div>
              <Badge className={`rounded-full ${statusStyles[a.status]} hover:opacity-90`}>
                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />
                {a.status}
              </Badge>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Cpu className="h-3.5 w-3.5" />
              {a.model}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border/50 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Tasks
                </p>
                <p className="mt-1 font-display text-xl">{a.tasks.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-border/50 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Accuracy
                </p>
                <p className="mt-1 font-display text-xl">{a.accuracy}%</p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 rounded-full">
                {a.status === "active" ? (
                  <>
                    <Pause className="mr-1.5 h-3.5 w-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-1.5 h-3.5 w-3.5" /> Resume
                  </>
                )}
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full">
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <Panel title="Orchestration graph" description="LangGraph view · click a node to inspect its state">
        <div className="relative h-80 overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-[oklch(0.62 0.18 275)]/8">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 320" preserveAspectRatio="none">
            <defs>
              <linearGradient id="edge" x1="0" x2="1">
                <stop offset="0%" stopColor="oklch(0.55 0.24 285)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="oklch(0.62 0.18 275)" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            {[
              [140, 160, 400, 80],
              [140, 160, 400, 160],
              [140, 160, 400, 240],
              [400, 80, 660, 120],
              [400, 160, 660, 160],
              [400, 240, 660, 200],
            ].map(([x1, y1, x2, y2], i) => (
              <motion.line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#edge)"
                strokeWidth="2"
                strokeDasharray="6 6"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.1 * i, duration: 0.6 }}
              />
            ))}
          </svg>
          {[
            { x: 140, y: 160, label: "Supervisor", accent: "leaf" },
            { x: 400, y: 80, label: "Carbon", accent: "leaf" },
            { x: 400, y: 160, label: "Supply", accent: "ocean" },
            { x: 400, y: 240, label: "Risk", accent: "solar" },
            { x: 660, y: 120, label: "Policy", accent: "ocean" },
            { x: 660, y: 160, label: "Report", accent: "leaf" },
            { x: 660, y: 200, label: "Steward", accent: "solar" },
          ].map((n, i) => (
            <motion.div
              key={n.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05 * i, type: "spring", stiffness: 180 }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(n.x / 800) * 100}%`, top: `${(n.y / 320) * 100}%` }}
            >
              <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs shadow-[0_8px_24px_-8px_oklch(0.42 0.22 285/0.4)]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    n.accent === "leaf"
                      ? "bg-[oklch(0.65 0.22 290)]"
                      : n.accent === "ocean"
                      ? "bg-[oklch(0.62 0.18 275)]"
                      : "bg-[oklch(0.85 0.08 290)]"
                  }`}
                />
                {n.label}
              </div>
            </motion.div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
