import { createFileRoute } from "@tanstack/react-router";
import { Database, Zap, Brain, Server, HardDrive, Plus } from "lucide-react";

import { PageHeader, Panel } from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dataSources } from "@/lib/mock-data";

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
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Connected substrate"
        title="Where the intelligence gets its senses."
        description="PostgreSQL, Redis, ChromaDB, watsonx.ai and Ollama — one graph, streaming into every agent."
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
                      ? "bg-[oklch(0.68_0.14_148)]/15 text-[oklch(0.42_0.09_158)]"
                      : "bg-[oklch(0.82_0.15_85)]/25 text-[oklch(0.5_0.14_65)]"
                  } hover:opacity-90`}
                >
                  {s.health}% healthy
                </Badge>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border/50 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Volume
                  </p>
                  <p className="mt-1 font-medium">{s.records}</p>
                </div>
                <div className="rounded-xl border border-border/50 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Last sync
                  </p>
                  <p className="mt-1 font-medium">{s.lastSync}</p>
                </div>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-[oklch(0.42_0.09_158)] to-[oklch(0.68_0.14_148)]"
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
