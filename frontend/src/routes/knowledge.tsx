import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Database,
  Layers,
  Cpu,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  Landmark,
  Globe,
  FlaskConical,
  ScrollText,
  Folder,
  AlertCircle
} from "lucide-react";

import { PageHeader, Panel, StatCard } from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { knowledgeBaseService, systemService, KnowledgeBaseResponse, SystemStatusResponse } from "@/services";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Base · EarthMind AI" },
      { name: "description", content: "The retrieval layer powering EarthMind's multi-agent reasoning." },
    ],
  }),
  component: KnowledgePage,
});

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const getDomainIcon = (domain: string) => {
  const d = domain.toLowerCase();
  if (d.includes("policy")) return Landmark;
  if (d.includes("finance") || d.includes("sdg")) return Globe;
  if (d.includes("research")) return FlaskConical;
  if (d.includes("rule")) return ScrollText;
  return Folder;
};

const getDomainColor = (index: number) => {
  const colors = [
    "from-primary/20",
    "from-[oklch(0.62_0.18_275)]/25",
    "from-[oklch(0.68_0.20_290)]/25",
    "from-[oklch(0.85_0.08_290)]/30",
  ];
  return colors[index % colors.length];
};

function KnowledgePage() {
  const [stats, setStats] = useState<KnowledgeBaseResponse | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [kbData, sysData] = await Promise.all([
          knowledgeBaseService.getKnowledgeBase(),
          systemService.getSystemStatus()
        ]);
        setStats(kbData);
        setSystemStatus(sysData);
      } catch (err: any) {
        console.error("Failed to load knowledge base data", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading knowledge base...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p>Error: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const collections = stats?.collections || [];
  const recent = stats?.recent_uploads || [];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Retrieval layer"
        title="Knowledge Base"
        description="The corpus your agents reason over — governed, versioned and vectorised for fast retrieval."
        actions={
          <Button className="rounded-full bg-gradient-to-r from-[oklch(0.42_0.22_285)] to-[oklch(0.55_0.24_285)] text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.42_0.22_285/0.7)]">
            <Upload className="mr-1.5 h-4 w-4" /> Upload documents
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Documents indexed" value={stats?.total_documents?.toLocaleString() || "0"} icon={BookOpen} accent="violet" index={0} />
        <StatCard label="Chunks" value={stats?.total_chunks?.toLocaleString() || "0"} icon={Layers} accent="ocean" index={1} />
        <StatCard label="Embedding model" value={systemStatus?.embedding_model || "Unknown"} icon={Cpu} accent="leaf" index={2} />
        <StatCard label="Vector store" value="ChromaDB" icon={Database} accent="solar" index={3} />
      </div>

      <Panel>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search across policies, research, municipality rules…"
            className="h-12 rounded-2xl border-border/60 bg-muted/40 pl-11 text-base"
          />
        </div>
      </Panel>

      <div>
        <h3 className="mb-4 font-display text-2xl tracking-tight">Collections</h3>
        {collections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/50 p-8 text-center text-muted-foreground">
            <Database className="mx-auto mb-3 h-8 w-8 opacity-50" />
            <p>No collections found in the knowledge base.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {collections.map((c, i) => {
              const Icon = getDomainIcon(c.domain);
              const color = getDomainColor(i);
              return (
                <motion.div
                  key={c.domain}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="glass group relative overflow-hidden rounded-3xl p-5"
                >
                  <div className={cn("pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br to-transparent blur-2xl", color)} />
                  <div className="flex items-start justify-between">
                    <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-numeric text-2xl tracking-tight">{c.documents.toLocaleString()}</span>
                  </div>
                  <h4 className="mt-4 font-display text-lg leading-tight tracking-tight capitalize">{c.domain}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{c.chunks.toLocaleString()} chunks</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Panel title="Recently uploaded" description="Streamed into ChromaDB via the ingestion pipeline">
        {recent.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No recently uploaded documents.
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-4 rounded-2xl border border-border/50 p-3"
              >
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.filename}</p>
                  <p className="mt-0.5 flex items-center gap-3 font-numeric text-[11px] text-muted-foreground">
                    <span>{formatBytes(d.size)}</span>
                    <span className="capitalize">· {d.domain}</span>
                    <span>· {new Date(d.uploaded_at).toLocaleDateString()}</span>
                  </p>
                </div>
                <Badge className="rounded-full bg-[oklch(0.72_0.16_160)]/12 text-[oklch(0.55_0.16_160)]">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Indexed
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
