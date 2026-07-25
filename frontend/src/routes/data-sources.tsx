import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Database, Zap, Brain, Server, HardDrive, Plus, Loader2 } from "lucide-react";

import { PageHeader, Panel } from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { systemService, SystemStatusResponse } from "@/services";

export const Route = createFileRoute("/data-sources")({
  head: () => ({
    meta: [
      { title: "Data Sources · EarthMind AI" },
      { name: "description", content: "Everything EarthMind reads, embeds and reasons over." },
    ],
  }),
  component: DataSourcesPage,
});

const iconFor: Record<string, typeof Database> = {
  Database: Database,
  Stream: Zap,
  "Vector Store": Brain,
  "Model Gateway": Server,
  "Local Models": HardDrive,
};

function DataSourcesPage() {
  const [status, setStatus] = useState<SystemStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await systemService.getSystemStatus();
        setStatus(res);
      } catch (err) {
        console.error("Failed to load system status", err);
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

  if (!status) return null;

  const dataSources = [
    {
      name: "PostgreSQL",
      kind: "Database",
      records: "Operational",
      health: status.services.postgres.connected ? 100 : 0,
      lastSync: status.services.postgres.connected ? "connected" : "disconnected",
    },
    {
      name: "Redis",
      kind: "Stream",
      records: "Operational",
      health: status.services.redis.connected ? 100 : 0,
      lastSync: status.services.redis.connected ? "connected" : "disconnected",
    },
    {
      name: "ChromaDB",
      kind: "Vector Store",
      records: `${status.documents} docs, ${status.chunks} chunks`,
      health: status.services.chromadb.connected ? 100 : 0,
      lastSync: status.services.chromadb.connected ? "connected" : "disconnected",
    },
    {
      name: "Ollama",
      kind: "Local Models",
      records: `Embedding: ${status.embedding_model}`,
      health: 100, // Assuming available if backend is running
      lastSync: "local",
    },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Connected substrate"
        title="Where the intelligence gets its senses."
        description="PostgreSQL, Redis, ChromaDB and Ollama — one graph, streaming into every agent."
        actions={
          <Button variant="outline" className="rounded-full">
            <Plus className="mr-1.5 h-4 w-4" /> Add source
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {dataSources.map((s) => {
          const Icon = iconFor[s.kind] ?? Database;
          const healthy = s.health >= 99;
          return (
            <Panel key={s.name} className="!p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-transparent p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.kind}</p>
                  </div>
                </div>
                <Badge
                  className={`rounded-full ${
                    healthy
                      ? "bg-[oklch(0.65_0.22_290)]/15 text-[oklch(0.42_0.22_285)]"
                      : "bg-[oklch(0.85_0.08_290)]/25 text-[oklch(0.55_0.15_290)]"
                  } hover:opacity-90`}
                >
                  {healthy ? "100% healthy" : "Offline"}
                </Badge>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border/50 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-1 font-medium text-xs">{s.records}</p>
                </div>
                <div className="rounded-xl border border-border/50 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    State
                  </p>
                  <p className="mt-1 font-medium capitalize text-xs">{s.lastSync}</p>
                </div>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${healthy ? 'bg-gradient-to-r from-[oklch(0.42_0.22_285)] to-[oklch(0.65_0.22_290)]' : 'bg-red-500/50'}`}
                  style={{ width: `${s.health}%` }}
                />
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
