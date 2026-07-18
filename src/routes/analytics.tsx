import { createFileRoute } from "@tanstack/react-router";
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
import { TrendingDown, Droplets, Wind, Recycle } from "lucide-react";

import { PageHeader, Panel, StatCard } from "@/components/ui-parts";
import { emissionsSeries } from "@/lib/mock-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · EarthMind AI" },
      { name: "description", content: "Forecasts and decompositions across your sustainability signal." },
    ],
  }),
  component: AnalyticsPage,
});

const waterData = emissionsSeries.map((m, i) => ({
  month: m.month,
  intensity: 42 - i * 1.2 + Math.sin(i) * 2,
}));

const wasteData = emissionsSeries.map((m, i) => ({
  month: m.month,
  landfill: 120 - i * 4,
  recycled: 60 + i * 5,
  composted: 20 + i * 2,
}));

function AnalyticsPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Predictive analytics"
        title="Signals, not spreadsheets."
        description="Forecasts blend historical ledgers with real-time telemetry, refined by watsonx.ai and grounded in your ChromaDB knowledge base."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="YoY reduction" value="12.7" unit="%" delta={2.4} icon={TrendingDown} accent="leaf" index={0} />
        <StatCard label="Water intensity" value="28.4" unit="m³/unit" delta={-6.1} icon={Droplets} accent="ocean" index={1} />
        <StatCard label="Air quality index" value="42" unit="AQI" delta={-3.8} icon={Wind} accent="solar" index={2} />
        <StatCard label="Circularity" value="71" unit="%" delta={4.2} icon={Recycle} accent="violet" index={3} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Water intensity" description="Withdrawals per production unit">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waterData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="intensity"
                  stroke="oklch(0.62 0.13 220)"
                  strokeWidth={2.5}
                  dot={{ fill: "oklch(0.62 0.13 220)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Waste streams" description="Tonnes routed monthly">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="recycled" stackId="a" fill="oklch(0.55 0.13 158)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="composted" stackId="a" fill="oklch(0.82 0.15 85)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="landfill" stackId="a" fill="oklch(0.65 0.05 260)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel
        title="Scenario explorer"
        description="Compare policy pathways against your current trajectory"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              name: "Business as usual",
              value: "1,240 tCO₂e",
              detail: "+17% by 2030",
              tone: "destructive",
            },
            {
              name: "Committed pathway",
              value: "620 tCO₂e",
              detail: "−41% by 2030",
              tone: "leaf",
            },
            {
              name: "Ambitious 1.5°C",
              value: "310 tCO₂e",
              detail: "−71% by 2030",
              tone: "ocean",
            },
          ].map((s) => (
            <div
              key={s.name}
              className={`rounded-2xl border p-5 ${
                s.tone === "destructive"
                  ? "border-destructive/30 bg-destructive/5"
                  : s.tone === "leaf"
                  ? "border-[oklch(0.68_0.14_148)]/40 bg-[oklch(0.68_0.14_148)]/8"
                  : "border-[oklch(0.62_0.13_220)]/40 bg-[oklch(0.62_0.13_220)]/8"
              }`}
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {s.name}
              </p>
              <p className="mt-2 font-display text-3xl tracking-tight">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.detail}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
