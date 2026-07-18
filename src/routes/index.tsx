import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Cpu,
  Gauge,
  Leaf,
  Zap,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";

import { PageHeader, Panel, StatCard } from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  activityFeed,
  emissionsSeries,
  energyMix,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

const severityIcon = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

const severityTone = {
  warning: "text-[oklch(0.6_0.16_60)] bg-[oklch(0.82_0.15_85)]/20",
  info: "text-[oklch(0.42_0.13_220)] bg-[oklch(0.62_0.13_220)]/15",
  success: "text-[oklch(0.42_0.09_158)] bg-[oklch(0.68_0.14_148)]/15",
};

function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Live · Multi-agent orchestration"
        title="A quieter planet, measured in real time."
        description="EarthMind AI unites LangGraph agents, watsonx.ai models and your operational data to turn sustainability from a report into a system."
        actions={
          <>
            <Button variant="outline" className="rounded-full">
              Export snapshot
            </Button>
            <Button className="rounded-full bg-gradient-to-r from-[oklch(0.42_0.09_158)] to-[oklch(0.55_0.13_158)] text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.42_0.09_158/0.7)]">
              <Sparkles className="mr-1.5 h-4 w-4" />
              Ask EarthMind
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total emissions"
          value="1,055"
          unit="tCO₂e"
          delta={-8.4}
          icon={Leaf}
          accent="leaf"
          index={0}
        />
        <StatCard
          label="Renewable share"
          value="83"
          unit="%"
          delta={5.1}
          icon={Zap}
          accent="solar"
          index={1}
        />
        <StatCard
          label="Active agents"
          value="12"
          unit="running"
          delta={2}
          icon={Cpu}
          accent="ocean"
          index={2}
        />
        <StatCard
          label="Data freshness"
          value="99.8"
          unit="% SLA"
          delta={0.3}
          icon={Gauge}
          accent="violet"
          index={3}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Emissions by scope"
          description="12-month decomposition · tCO₂e"
          action={
            <div className="flex gap-1.5 text-xs">
              {[
                { k: "scope1", label: "Scope 1", color: "oklch(0.55 0.13 158)" },
                { k: "scope2", label: "Scope 2", color: "oklch(0.62 0.13 220)" },
                { k: "scope3", label: "Scope 3", color: "oklch(0.82 0.15 85)" },
              ].map((s) => (
                <span
                  key={s.k}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-2.5 py-1 text-muted-foreground"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.label}
                </span>
              ))}
            </div>
          }
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emissionsSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.13 158)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="oklch(0.55 0.13 158)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.62 0.13 220)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="oklch(0.62 0.13 220)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.82 0.15 85)" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="oklch(0.82 0.15 85)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 150 / 0.5)" vertical={false} />
                <XAxis dataKey="month" stroke="oklch(0.5 0.02 160)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.02 160)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(1 0 0)",
                    border: "1px solid oklch(0.9 0.01 150)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="scope3" stackId="1" stroke="oklch(0.82 0.15 85)" fill="url(#g3)" strokeWidth={2} />
                <Area type="monotone" dataKey="scope2" stackId="1" stroke="oklch(0.62 0.13 220)" fill="url(#g2)" strokeWidth={2} />
                <Area type="monotone" dataKey="scope1" stackId="1" stroke="oklch(0.55 0.13 158)" fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Energy mix" description="Powering your operations">
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={energyMix}
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {energyMix.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(1 0 0)",
                    border: "1px solid oklch(0.9 0.01 150)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl">83%</span>
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                renewable
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {energyMix.map((e) => (
              <div key={e.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: e.color }}
                  />
                  <span>{e.name}</span>
                </div>
                <span className="tabular-nums text-muted-foreground">{e.value}%</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Agent activity"
          description="Signals from the multi-agent runtime"
          action={
            <Button variant="ghost" size="sm" className="rounded-full text-primary">
              View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          }
        >
          <ul className="divide-y divide-border/50">
            {activityFeed.map((a, i) => {
              const Icon = severityIcon[a.severity];
              return (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.35 }}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className={`mt-0.5 rounded-xl p-2 ${severityTone[a.severity]}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{a.agent}</span>{" "}
                      <span className="text-muted-foreground">{a.action}</span>
                    </p>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Net-zero trajectory" description="On track for 2035 target">
          <div className="space-y-5">
            {[
              { label: "2025 baseline", value: 100, tone: "muted" },
              { label: "Current", value: 68, tone: "leaf" },
              { label: "2030 target", value: 45, tone: "ocean" },
              { label: "2035 net-zero", value: 8, tone: "solar" },
            ].map((row, i) => (
              <div key={row.label}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="tabular-nums">{row.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.value}%` }}
                    transition={{ duration: 0.9, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
                    className={
                      row.tone === "leaf"
                        ? "h-full bg-gradient-to-r from-[oklch(0.42_0.09_158)] to-[oklch(0.68_0.14_148)]"
                        : row.tone === "ocean"
                        ? "h-full bg-gradient-to-r from-[oklch(0.42_0.13_220)] to-[oklch(0.62_0.13_220)]"
                        : row.tone === "solar"
                        ? "h-full bg-gradient-to-r from-[oklch(0.6_0.16_60)] to-[oklch(0.82_0.15_85)]"
                        : "h-full bg-muted-foreground/40"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/8 to-transparent p-3 text-xs">
            <Activity className="h-4 w-4 text-primary" />
            <span>
              <span className="font-medium">Forecast:</span>{" "}
              <span className="text-muted-foreground">
                Trajectory 3.2% ahead of pledged pathway
              </span>
            </span>
          </div>
          <Badge className="mt-4 rounded-full bg-[oklch(0.68_0.14_148)]/15 text-[oklch(0.42_0.09_158)] hover:bg-[oklch(0.68_0.14_148)]/20">
            SBTi validated
          </Badge>
        </Panel>
      </div>
    </div>
  );
}
