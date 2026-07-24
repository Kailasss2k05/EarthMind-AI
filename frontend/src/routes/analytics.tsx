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
import { TrendingDown, Droplets, Wind, Recycle } from "lucide-react";

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

  useEffect(() => {
    async function load() {
      try {
        const res = await analyticsService.getAnalytics();
        setData(res);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const waterData = data?.time_series.map(point => ({
    month: new Date(point.date).toLocaleString('default', { month: 'short' }),
    intensity: point.water_intensity,
  })) || [];

  const wasteData = data?.time_series.map(point => ({
    month: new Date(point.date).toLocaleString('default', { month: 'short' }),
    landfill: point.waste_landfill,
    recycled: point.waste_recycled,
    composted: point.waste_composted,
  })) || [];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Predictive analytics"
        title="Signals, not spreadsheets."
        description="Forecasts blend historical ledgers with real-time telemetry, refined by watsonx.ai and grounded in your ChromaDB knowledge base."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="YoY reduction" value={data?.kpis.yoy_reduction.value.toString() || "0"} unit="%" delta={data?.kpis.yoy_reduction.delta} icon={TrendingDown} accent="leaf" index={0} />
        <StatCard label="Water intensity" value={data?.kpis.water_intensity.value.toString() || "0"} unit="m³/unit" delta={data?.kpis.water_intensity.delta} icon={Droplets} accent="ocean" index={1} />
        <StatCard label="Air quality index" value={data?.kpis.aqi.value.toString() || "0"} unit="AQI" delta={data?.kpis.aqi.delta} icon={Wind} accent="solar" index={2} />
        <StatCard label="Circularity" value={data?.kpis.circularity.value.toString() || "0"} unit="%" delta={data?.kpis.circularity.delta} icon={Recycle} accent="violet" index={3} />
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
                  stroke="oklch(0.62 0.18 275)"
                  strokeWidth={2.5}
                  dot={{ fill: "oklch(0.62 0.18 275)", r: 3 }}
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
                <Bar dataKey="recycled" stackId="a" fill="oklch(0.55 0.24 285)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="composted" stackId="a" fill="oklch(0.85 0.08 290)" radius={[0, 0, 0, 0]} />
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
          {(data?.scenarios || []).map((s) => (
            <div
              key={s.name}
              className={`rounded-2xl border p-5 ${
                s.name.toLowerCase().includes("usual")
                  ? "border-destructive/30 bg-destructive/5"
                  : s.name.toLowerCase().includes("ambitious")
                  ? "border-[oklch(0.62 0.18 275)]/40 bg-[oklch(0.62 0.18 275)]/8"
                  : "border-[oklch(0.65 0.22 290)]/40 bg-[oklch(0.65 0.22 290)]/8"
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
