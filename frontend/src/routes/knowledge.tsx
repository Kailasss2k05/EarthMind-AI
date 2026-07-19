/**
 * TODO: ENDPOINT MISSING (partial)
 * The stat cards and collections list use static data.
 * No /api/v1/knowledge or ChromaDB browse endpoint exists yet.
 *
 * WHAT IS CONNECTED:
 *   - GET /api/v1/health → shows real ChromaDB connectivity status
 *
 * To fully connect this page:
 *   GET /api/v1/knowledge/stats  →  { totalDocs, totalChunks, collections }
 *   GET /api/v1/knowledge/documents  →  { items: KnowledgeDoc[] }
 *   POST /api/v1/knowledge/upload  →  upload and index a new document
 */
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
} from "lucide-react";

import { PageHeader, Panel, StatCard } from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Base · EarthMind AI" },
      { name: "description", content: "The retrieval layer powering EarthMind's multi-agent reasoning." },
    ],
  }),
  component: KnowledgePage,
});

const collections = [
  { name: "Government Policies", icon: Landmark, docs: 412, color: "from-primary/20" },
  { name: "UN SDGs", icon: Globe, docs: 176, color: "from-[oklch(0.62_0.18_275)]/25" },
  { name: "Research Papers", icon: FlaskConical, docs: 1284, color: "from-[oklch(0.68_0.20_290)]/25" },
  { name: "Municipality Rules", icon: ScrollText, docs: 328, color: "from-[oklch(0.85_0.08_290)]/30" },
];

const recent = [
  { name: "EU Green Deal — Consolidated 2026.pdf", size: "4.2 MB", status: "indexed", chunks: 812 },
  { name: "IPCC AR7 Synthesis Report.pdf", size: "12.8 MB", status: "indexing", chunks: 0, progress: 62 },
  { name: "Rotterdam Climate Adaptation Plan.docx", size: "2.1 MB", status: "indexed", chunks: 214 },
  { name: "SDG 11 municipal case studies.csv", size: "684 KB", status: "indexed", chunks: 91 },
  { name: "Coastal resilience finance mechanisms.pdf", size: "6.4 MB", status: "queued", chunks: 0 },
];

function KnowledgePage() {
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
        <StatCard label="Documents indexed" value="2,204" icon={BookOpen} accent="violet" index={0} />
        <StatCard label="Chunks" value="184,392" icon={Layers} accent="ocean" index={1} />
        <StatCard label="Embedding model" value="ibm/slate-125m" icon={Cpu} accent="leaf" index={2} />
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {collections.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="glass group relative overflow-hidden rounded-3xl p-5"
            >
              <div className={cn("pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br to-transparent blur-2xl", c.color)} />
              <div className="flex items-start justify-between">
                <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <span className="font-numeric text-2xl tracking-tight">{c.docs}</span>
              </div>
              <h4 className="mt-4 font-display text-lg leading-tight tracking-tight">{c.name}</h4>
              <p className="mt-1 text-xs text-muted-foreground">Auto-refreshed weekly</p>
            </motion.div>
          ))}
        </div>
      </div>

      <Panel title="Recently uploaded" description="Streamed into ChromaDB via the ingestion pipeline">
        <div className="space-y-3">
          {recent.map((d) => (
            <div
              key={d.name}
              className="flex items-center gap-4 rounded-2xl border border-border/50 p-3"
            >
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <p className="mt-0.5 flex items-center gap-3 font-numeric text-[11px] text-muted-foreground">
                  <span>{d.size}</span>
                  {d.chunks > 0 && <span>· {d.chunks.toLocaleString()} chunks</span>}
                </p>
                {d.status === "indexing" && (
                  <Progress value={d.progress} className="mt-2 h-1" />
                )}
              </div>
              {d.status === "indexed" && (
                <Badge className="rounded-full bg-[oklch(0.72_0.16_160)]/12 text-[oklch(0.55_0.16_160)]">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Indexed
                </Badge>
              )}
              {d.status === "indexing" && (
                <Badge className="rounded-full bg-primary/12 text-primary">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Indexing
                </Badge>
              )}
              {d.status === "queued" && (
                <Badge className="rounded-full bg-muted text-muted-foreground">Queued</Badge>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
