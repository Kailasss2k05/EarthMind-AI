import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Copy,
  Trash2,
  FileText,
  MapPin,
  Calendar,
} from "lucide-react";

import { PageHeader, Panel } from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { historyService, HistoryItem } from "@/services";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History · EarthMind AI" },
      { name: "description", content: "Timeline of previous sustainability plans and reports." },
    ],
  }),
  component: HistoryPage,
});

const statusStyle: Record<string, string> = {
  Completed: "bg-[oklch(0.72_0.16_160)]/12 text-[oklch(0.55_0.16_160)]",
  completed: "bg-[oklch(0.72_0.16_160)]/12 text-[oklch(0.55_0.16_160)]",
  partial: "bg-[oklch(0.85_0.12_60)]/20 text-[oklch(0.55_0.15_60)]",
  Draft: "bg-[oklch(0.85_0.08_290)]/25 text-[oklch(0.55_0.15_290)]",
  Archived: "bg-muted text-muted-foreground",
};

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce the search input so we don't hit the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function load() {
      try {
        const res = await historyService.getHistory(0, 100, debouncedQuery);
        setItems(res.items);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [debouncedQuery]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Journal"
        title="History"
        description="Every plan your agents have produced — searchable, filterable and always one click from a rerun."
      />

      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, location, or SDG…"
              className="h-11 rounded-full border-border/60 bg-muted/40 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full">
              <Calendar className="mr-1.5 h-4 w-4" /> Date
            </Button>
            <Button variant="outline" className="rounded-full">
              <MapPin className="mr-1.5 h-4 w-4" /> Location
            </Button>
            <Button variant="outline" className="rounded-full">
              <Filter className="mr-1.5 h-4 w-4" /> Filters
            </Button>
          </div>
        </div>
      </Panel>

      <div className="relative">
        <span className="absolute left-4 top-2 bottom-2 hidden w-px bg-border md:block" />
        <div className="space-y-4">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">
              No history found{debouncedQuery ? ` for "${debouncedQuery}"` : "."} Run a query to see results here.
            </p>
          )}
          {items.map((it, i) => (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="glass group relative rounded-3xl p-5 transition-all hover:shadow-[0_20px_50px_-20px_oklch(0.42_0.22_285/0.35)] md:pl-14"
            >
              <span className="absolute left-2.5 top-7 hidden h-3 w-3 rounded-full bg-primary ring-4 ring-background md:block" />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h3 className="font-display text-lg tracking-tight">{it.title}</h3>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-numeric"><Calendar className="h-3 w-3" /> {new Date(it.created_at).toLocaleString()}</span>
                    <span className="font-numeric">ID {it.id.split('-')[0]}</span>
                    <span className="font-numeric">{it.type.toUpperCase()}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-sm text-muted-foreground">
                    {it.summary}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("rounded-full", statusStyle[it.status] || "bg-muted text-foreground/80")}>{it.status}</Badge>
                  {/* M-8: Link to specific report when type is "report", else to reports list */}
                  <Button asChild size="sm" className="rounded-full">
                    {it.type === "report" ? (
                      <Link to="/reports" search={{ reportId: it.id }}>Open</Link>
                    ) : (
                      <Link to="/reports">Open</Link>
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
                      <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
