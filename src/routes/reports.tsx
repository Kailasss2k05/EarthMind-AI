import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download, MoreHorizontal, Plus } from "lucide-react";

import { PageHeader, Panel } from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { reports } from "@/lib/mock-data";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports · EarthMind AI" },
      { name: "description", content: "CSRD, TCFD, GRI and GHG Protocol disclosures drafted by your agents." },
    ],
  }),
  component: ReportsPage,
});

const statusStyle: Record<string, string> = {
  Draft: "bg-[oklch(0.85 0.08 290)]/20 text-[oklch(0.55 0.15 290)]",
  "In Review": "bg-[oklch(0.62 0.18 275)]/15 text-[oklch(0.45 0.20 275)]",
  Published: "bg-[oklch(0.65 0.22 290)]/15 text-[oklch(0.42 0.22 285)]",
};

function ReportsPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Disclosure studio"
        title="Every framework, one narrative."
        description="Reports draft themselves from your live data, cross-checked against the latest regulations by Policy Scout."
        actions={
          <Button className="rounded-full bg-gradient-to-r from-[oklch(0.42 0.22 285)] to-[oklch(0.55 0.24 285)] text-primary-foreground">
            <Plus className="mr-1.5 h-4 w-4" /> New report
          </Button>
        }
      />

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="pb-4 font-medium">Report</th>
                <th className="pb-4 font-medium">Framework</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Owner agent</th>
                <th className="pb-4 font-medium">Updated</th>
                <th className="pb-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {reports.map((r) => (
                <tr key={r.id} className="group transition-colors hover:bg-muted/30">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-2 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{r.title}</span>
                    </div>
                  </td>
                  <td className="py-4 text-muted-foreground">{r.framework}</td>
                  <td className="py-4">
                    <Badge className={`rounded-full ${statusStyle[r.status]} hover:opacity-90`}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-4 text-muted-foreground">{r.owner}</td>
                  <td className="py-4 text-muted-foreground">{r.updated}</td>
                  <td className="py-4">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "CSRD ready", value: "94%", note: "12 ESRS datapoints outstanding" },
          { title: "TCFD coverage", value: "100%", note: "Physical & transition risk" },
          { title: "GRI 2025", value: "88%", note: "Awaiting supplier surveys" },
        ].map((c) => (
          <Panel key={c.title} title={c.title}>
            <p className="font-display text-4xl tracking-tight text-gradient">{c.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{c.note}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
