import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
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
  AlertCircle,
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
import type { DocumentItem } from "@/services/types";

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
  domain: string;
  chunks: number;
};

function inferKind(filename: string): "pdf" | "docx" | "csv" | "image" {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "docx" || ext === "doc") return "docx";
  if (ext === "csv" || ext === "xlsx") return "csv";
  if (["png", "jpg", "jpeg", "svg"].includes(ext || "")) return "image";
  return "pdf";
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

function DocRowActions({ id, onDelete, onDownload, onPreview, isDeleting }: { id: string; onDelete: (id: string) => void; onDownload: (id: string) => void; onPreview: (id: string) => void; isDeleting: boolean; }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8" disabled={isDeleting}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onPreview(id)}><Eye className="mr-2 h-4 w-4" /> Preview</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDownload(id)}><Download className="mr-2 h-4 w-4" /> Download</DropdownMenuItem>
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDomain, setUploadDomain] = useState("research");

  const fetchDocs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await documentService.getDocuments();
      const formatted = res.items.map((item: DocumentItem) => ({
        id: item.id,
        name: item.filename,
        kind: inferKind(item.filename),
        size: formatSize(item.size),
        date: item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString() : "Unknown",
        domain: item.domain,
        chunks: item.chunks,
      }));
      setDocs(formatted);
    } catch (e) {
      console.error("Failed to fetch docs:", e);
      setError(e instanceof Error ? e.message : "Failed to load documents.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const toastId = toast.loading("Uploading document...");
    try {
      await documentService.uploadDocument(file, uploadDomain);
      toast.success("Document uploaded successfully!", { id: toastId });
      fetchDocs();
    } catch (err) {
      console.error("Upload failed", err);
      toast.error(err instanceof Error ? err.message : "Upload failed", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = (id: string) => {
    const url = documentService.getDownloadUrl(id);
    const link = document.createElement("a");
    link.href = url;
    link.download = id.split(":").pop() ?? "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (id: string) => {
    const url = documentService.getDownloadUrl(id);
    window.open(url, "_blank");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    setDeletingId(id);
    const toastId = toast.loading("Deleting document...");
    try {
      await documentService.deleteDocument(id);
      toast.success("Document deleted successfully.", { id: toastId });
      setDocs(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      console.error("Failed to delete document", e);
      toast.error("Failed to delete document.", { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocs = docs.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="File manager"
        title="Documents"
        description="Every source file behind your plans — organised, indexed and ready for retrieval."
        actions={
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={uploadDomain}
              onChange={(e) => setUploadDomain(e.target.value)}
            >
              <option value="sdg">SDG</option>
              <option value="environmental">Environmental</option>
              <option value="policy">Policy</option>
              <option value="finance">Finance</option>
              <option value="research">Research</option>
            </select>
            <Button 
              className="rounded-full bg-gradient-to-r from-[oklch(0.42_0.22_285)] to-[oklch(0.55_0.24_285)] text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.42_0.22_285/0.7)]"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              <Upload className="mr-1.5 h-4 w-4" /> {isUploading ? "Uploading..." : "Upload"}
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              accept=".pdf" 
              onChange={handleFileSelected} 
            />
          </div>
        }
      />

      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search documents by name or domain…" 
              className="h-11 rounded-full pl-10 border-border/60 bg-muted/40" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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

      {error ? (
        <Panel className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-destructive/10 p-3 text-destructive mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Failed to load documents</h3>
          <p className="mb-6 text-sm text-muted-foreground">{error}</p>
          <Button onClick={fetchDocs} variant="outline">Retry</Button>
        </Panel>
      ) : isLoading ? (
        <div className={cn("grid gap-4", view === "grid" ? "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass rounded-3xl p-5 h-[160px] animate-pulse">
              <div className="h-10 w-10 rounded-2xl bg-muted mb-4" />
              <div className="h-4 w-3/4 rounded bg-muted mb-2" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : docs.length === 0 ? (
        <Panel className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
          <FileText className="mb-4 h-10 w-10 opacity-20" />
          <p>No documents have been indexed.</p>
        </Panel>
      ) : filteredDocs.length === 0 ? (
        <Panel className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
          <Search className="mb-4 h-10 w-10 opacity-20" />
          <p>No documents match your search.</p>
        </Panel>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filteredDocs.map((d, i) => {
            const Icon = iconMap[d.kind];
            const isDeleting = deletingId === d.id;
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.35 }}
                className={cn(
                  "glass group relative rounded-3xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_oklch(0.42_0.22_285/0.35)]",
                  isDeleting && "opacity-50 pointer-events-none"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className={cn("rounded-2xl p-3", colorMap[d.kind])}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <DocRowActions id={d.id} onDelete={handleDelete} onDownload={handleDownload} onPreview={handlePreview} isDeleting={isDeleting} />
                </div>
                <p className="mt-4 truncate text-sm font-medium">{d.name}</p>
                <p className="mt-1 font-numeric text-[11px] text-muted-foreground">{d.size} · {d.date}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className="rounded-full bg-primary/12 text-primary capitalize hover:bg-primary/20">
                    {d.domain}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-muted-foreground">
                    {d.chunks} chunk{d.chunks !== 1 && "s"}
                  </Badge>
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
                  <th className="pb-4 font-medium">Domain</th>
                  <th className="pb-4 font-medium">Chunks</th>
                  <th className="pb-4 font-medium">Size</th>
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredDocs.map((d) => {
                  const Icon = iconMap[d.kind];
                  const isDeleting = deletingId === d.id;
                  return (
                    <tr key={d.id} className={cn("hover:bg-muted/30 transition-colors", isDeleting && "opacity-50 pointer-events-none")}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("rounded-xl p-2", colorMap[d.kind])}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium max-w-[200px] truncate" title={d.name}>{d.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge className="rounded-full bg-primary/12 text-primary capitalize hover:bg-primary/20">
                          {d.domain}
                        </Badge>
                      </td>
                      <td className="py-3 font-numeric text-muted-foreground">{d.chunks}</td>
                      <td className="py-3 font-numeric text-muted-foreground">{d.size}</td>
                      <td className="py-3 font-numeric text-muted-foreground">{d.date}</td>
                      <td className="py-3 text-right">
                        <DocRowActions id={d.id} onDelete={handleDelete} onDownload={handleDownload} onPreview={handlePreview} isDeleting={isDeleting} />
                      </td>
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
