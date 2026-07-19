/**
 * TODO: ENDPOINT MISSING
 * This page currently renders static mock data.
 * A real history endpoint does NOT yet exist in the backend.
 *
 * To connect this page to real data, the backend needs:
 *   GET /api/v1/history  →  { items: HistoryItem[] }
 *
 * Once that endpoint is added:
 *   1. Add a HistoryItem interface to services/types.ts
 *   2. Add getHistory() to services/history.service.ts
 *   3. Replace the `items` array below with a useQuery() call
 */
import { createFileRoute, Link } from "@tanstack/react-router";
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

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History · EarthMind AI" },
      { name: "description", content: "Timeline of previous sustainability plans and reports." },
    ],
  }),
  component: HistoryPage,
});

const items = [
  { id: "h-014", title: "Urban flooding resilience — Rotterdam", loc: "Rotterdam, NL", date: "Today · 12:04", sdgs: ["11", "13", "6"], status: "Completed" },
  { id: "h-013", title: "Zero-emission bus corridor design", loc: "Lisbon, PT", date: "Yesterday · 16:22", sdgs: ["11", "13"], status: "Completed" },
  { id: "h-012", title: "District heating from wastewater", loc: "Copenhagen, DK", date: "2 days ago", sdgs: ["7", "11", "13"], status: "Draft" },
  { id: "h-011", title: "Coastal mangrove restoration plan", loc: "Cebu, PH", date: "3 days ago", sdgs: ["13", "14", "15"], status: "Completed" },
  { id: "h-010", title: "Circular textile industry roadmap", loc: "Milan, IT", date: "1 week ago", sdgs: ["12", "9"], status: "Archived" },
  { id: "h-009", title: "Smart irrigation for arid regions", loc: "Marrakesh, MA", date: "2 weeks ago", sdgs: ["2", "6", "13"], status: "Completed" },
];

const statusStyle: Record<string, string> = {
  Completed: "bg-[oklch(0.72_0.16_160)]/12 text-[oklch(0.55_0.16_160)]",
  Draft: "bg-[oklch(0.85_0.08_290)]/25 text-[oklch(0.55_0.15_290)]",
  Archived: "bg-muted text-muted-foreground",
};

function HistoryPage() {
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
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {it.loc}</span>
                    <span className="flex items-center gap-1 font-numeric"><Calendar className="h-3 w-3" /> {it.date}</span>
                    <span className="font-numeric">ID {it.id}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {it.sdgs.map((s) => (
                      <span
                        key={s}
                        className="inline-flex h-6 items-center rounded-full border border-primary/20 bg-primary/5 px-2 font-numeric text-[11px] text-primary"
                      >
                        SDG {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("rounded-full", statusStyle[it.status])}>{it.status}</Badge>
                  <Button asChild size="sm" className="rounded-full">
                    <Link to="/reports">Open</Link>
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
