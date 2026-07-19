import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  Activity,
  Leaf,
  Bot,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  TrendingUp,
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
import { emissionsSeries, activityFeed } from "@/lib/mock-data";

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

const kpis = [
  {
    label: "Sustainability Score",
    value: "92.4",
    unit: "/100",
    delta: 4.8,
    icon: Leaf,
    caption: "Aligned to 14 UN SDGs",
  },
  {
    label: "Active Agents",
    value: "12",
    unit: "running",
    delta: 2,
    icon: Bot,
    caption: "watsonx.ai · LangGraph",
  },
  {
    label: "Emissions Avoided",
    value: "1,055",
    unit: "tCO₂e",
    delta: -8.4,
    icon: Activity,
    caption: "vs. baseline scenario",
    invertColors: true,
  },
  {
    label: "Renewable Energy",
    value: "83",
    unit: "%",
    delta: 5.1,
    icon: Zap,
    caption: "Solar · Wind · Hydro",
  },
];

function OverviewPage() {
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
          <span className="italic text-transparent [background:var(--gradient-primary)] bg-clip-text">
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
            variant="outline"
            size="lg"
            className="h-11 rounded-full border-border/70 bg-white/60 px-5 text-sm font-medium backdrop-blur-sm dark:bg-white/5"
          >
            View live agents
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
        <EmissionsChart />
        <ActivityStream />
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
  icon: typeof Leaf;
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

/* ---------- Emissions chart ---------- */
function EmissionsChart() {
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
              Emissions trajectory
            </h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            12-month decomposition · tCO₂e · SBTi validated
          </p>
        </div>
        <div className="hidden items-center gap-3 text-[11px] font-medium text-muted-foreground sm:flex">
          {[
            { c: "oklch(0.42 0.22 285)", l: "Scope 1" },
            { c: "oklch(0.62 0.22 290)", l: "Scope 2" },
            { c: "oklch(0.85 0.08 290)", l: "Scope 3" },
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
            data={emissionsSeries}
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
              <linearGradient id="s3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.85 0.08 290)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="oklch(0.85 0.08 290)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 4"
              stroke="oklch(0.5 0.02 285 / 0.18)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
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
              dataKey="scope3"
              stackId="1"
              stroke="oklch(0.85 0.08 290)"
              fill="url(#s3)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="scope2"
              stackId="1"
              stroke="oklch(0.62 0.22 290)"
              fill="url(#s2)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="scope1"
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
};

function ActivityStream() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.28 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-medium tracking-tight">
            Agent activity
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Live signals from the runtime
          </p>
        </div>
        <Badge className="rounded-full border border-border/60 bg-white/60 font-normal text-muted-foreground shadow-none hover:bg-white/70 dark:bg-white/5">
          Live
        </Badge>
      </div>
      <ul className="mt-5 space-y-4">
        {activityFeed.slice(0, 5).map((a) => (
          <li key={a.id} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-medium",
                severityStyles[a.severity],
              )}
            >
              {a.agent
                .split(" ")
                .map((w) => w[0])
                .join("")}
            </span>
            <div className="min-w-0">
              <p className="text-sm leading-snug">
                <span className="font-medium">{a.agent}</span>{" "}
                <span className="text-muted-foreground">{a.action}</span>
              </p>
              <p className="mt-0.5 font-numeric text-[11px] text-muted-foreground">
                {a.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
