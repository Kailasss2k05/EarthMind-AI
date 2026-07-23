/**
 * TODO: ENDPOINT MISSING
 * This page currently renders a hardcoded list of documents.
 * No file upload or document listing endpoint exists in the backend yet.
 *
 * To connect this page to real data, the backend needs:
 *   GET  /api/v1/documents              →  { items: Document[] }
 *   POST /api/v1/documents/upload       →  multipart/form-data file upload
 *   DELETE /api/v1/documents/{doc_id}   →  delete a document
 *
 * Once those endpoints exist:
 *   1. Add Document interface to services/types.ts
 *   2. Add listDocuments() / uploadDocument() to services/document.service.ts
 *   3. Replace the `docs` array below with a useQuery() call
 */
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Upload,
  Grid3x3,
  List,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileType,
  MoreHorizontal,
  Eye,
  Trash2,
  Download,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { PageHeader, Panel } from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { documentService } from "@/services";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents · EarthMind AI" },
      { name: "description", content: "A beautiful file manager for the documents fuelling your agents." },
    ],
  }),
  component: DocumentsPage,
});

type Doc = {
  id: string;
  name: string;
  kind: "pdf" | "docx" | "csv" | "image";
  size: string;
  date: string;
  status: "indexed" | "pending";
};

function inferKind(filename: string): "pdf" | "docx" | "csv" | "image" {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "docx" || ext === "doc") return "docx";
  if (ext === "csv" || ext === "xlsx") return "csv";
  if (["png", "jpg", "jpeg", "svg"].includes(ext || "")) return "image";
  return "pdf"; // default fallback
}

function formatSize(bytes: number) {
  if (bytes === 0) return "Unknown";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

const iconMap = {
  pdf: FileText,
  docx: FileType,
  csv: FileSpreadsheet,
  image: FileImage,
};
const colorMap = {
  pdf: "bg-[oklch(0.85_0.08_25)]/30 text-[oklch(0.55_0.18_25)]",
  docx: "bg-[oklch(0.62_0.18_275)]/15 text-[oklch(0.45_0.20_275)]",
  csv: "bg-[oklch(0.72_0.16_160)]/12 text-[oklch(0.55_0.16_160)]",
  image: "bg-primary/12 text-primary",
};

function DocRowActions({ id, onDelete }: { id: string; onDelete: (id: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> Preview</DropdownMenuItem>
        <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(id)}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DocumentsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [docs, setDocs] = useState<Doc[]>([]);

  const fetchDocs = async () => {
    try {
      const res = await documentService.getDocuments();
      const formatted = res.items.map(item => ({
        id: item.id,
        name: item.filename,
        kind: inferKind(item.filename),
        size: formatSize(item.size),
        date: item.uploaded_at ? item.uploaded_at.split("T")[0] : "Unknown",
        status: "indexed" as const,
      }));
      setDocs(formatted);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await documentService.deleteDocument(id);
      fetchDocs();
    } catch (e) {
      console.error("Failed to delete document", e);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="File manager"
        title="Documents"
        description="Every source file behind your plans — organised, indexed and ready for retrieval."
        actions={
          <Button className="rounded-full bg-gradient-to-r from-[oklch(0.42_0.22_285)] to-[oklch(0.55_0.24_285)] text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.42_0.22_285/0.7)]">
            <Upload className="mr-1.5 h-4 w-4" /> Upload
          </Button>
        }
      />

      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search documents…" className="h-11 rounded-full pl-10 border-border/60 bg-muted/40" />
          </div>
          <div className="inline-flex rounded-full border border-border/60 bg-muted/30 p-1">
            <button
              onClick={() => setView("grid")}
              className={cn("flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition", view === "grid" ? "bg-background shadow-sm" : "text-muted-foreground")}
            >
              <Grid3x3 className="h-3.5 w-3.5" /> Grid
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition", view === "list" ? "bg-background shadow-sm" : "text-muted-foreground")}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>
        </div>
      </Panel>

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {docs.map((d, i) => {
            const Icon = iconMap[d.kind];
            return (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.35 }}
                className="glass group relative rounded-3xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_oklch(0.42_0.22_285/0.35)]"
              >
                <div className="flex items-start justify-between">
                  <div className={cn("rounded-2xl p-3", colorMap[d.kind])}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <DocRowActions id={d.id} onDelete={handleDelete} />
                </div>
                <p className="mt-4 truncate text-sm font-medium">{d.name}</p>
                <p className="mt-1 font-numeric text-[11px] text-muted-foreground">{d.size} · {d.date}</p>
                <div className="mt-3">
                  {d.status === "indexed" ? (
                    <Badge className="rounded-full bg-[oklch(0.72_0.16_160)]/12 text-[oklch(0.55_0.16_160)]">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Indexed
                    </Badge>
                  ) : (
                    <Badge className="rounded-full bg-muted text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" /> Pending
                    </Badge>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <th className="pb-4 font-medium">Name</th>
                  <th className="pb-4 font-medium">Size</th>
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {docs.map((d) => {
                  const Icon = iconMap[d.kind];
                  return (
                    <tr key={d.name} className="hover:bg-muted/30">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("rounded-xl p-2", colorMap[d.kind])}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{d.name}</span>
                        </div>
                      </td>
                      <td className="py-3 font-numeric text-muted-foreground">{d.size}</td>
                      <td className="py-3 font-numeric text-muted-foreground">{d.date}</td>
                      <td className="py-3">
                        {d.status === "indexed" ? (
                          <Badge className="rounded-full bg-[oklch(0.72_0.16_160)]/12 text-[oklch(0.55_0.16_160)]">Indexed</Badge>
                        ) : (
                          <Badge className="rounded-full bg-muted text-muted-foreground">Pending</Badge>
                        )}
                      </td>
                      <td className="py-3 text-right"><DocRowActions id={d.id} onDelete={handleDelete} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
