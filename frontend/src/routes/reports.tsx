/**
 * TODO: ENDPOINT MISSING
 * This page currently renders static mock data from a hardcoded report.
 * A real reports endpoint does NOT yet exist in the backend.
 *
 * To connect this page to real data, the backend needs:
 *   GET /api/v1/reports/{request_id}  →  { sections: ReportSection[], metadata: ReportMeta }
 *
 * Once that endpoint is added:
 *   1. Add report types to services/types.ts
 *   2. Add getReport(requestId) to services/report.service.ts
 *   3. Read the request_id from route search params and fetch the report
 */
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Share2,
  FileDown,
  Braces,
  Leaf,
  Wallet,
  Scale,
  ShieldAlert,
  CalendarClock,
  Sparkles,
  ExternalLink,
  Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

import { PageHeader, Panel } from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Report · EarthMind AI" },
      { name: "description", content: "Multi-agent sustainability plan report." },
    ],
  }),
  component: ReportPage,
});

const sections = [
  { id: "summary", label: "Executive Summary" },
  { id: "sdg", label: "Recommended SDGs" },
  { id: "env", label: "Environmental Analysis" },
  { id: "fin", label: "Financial Analysis" },
  { id: "policy", label: "Policy Recommendations" },
  { id: "risk", label: "Risk Analysis" },
  { id: "timeline", label: "Timeline" },
  { id: "reco", label: "Recommendations" },
  { id: "refs", label: "References" },
];

const sdgBars = [
  { sdg: "SDG 6", score: 82 },
  { sdg: "SDG 11", score: 96 },
  { sdg: "SDG 13", score: 91 },
  { sdg: "SDG 9", score: 74 },
  { sdg: "SDG 15", score: 68 },
];

const budgetPie = [
  { name: "Infrastructure", value: 42, color: "oklch(0.55 0.24 285)" },
  { name: "Technology", value: 24, color: "oklch(0.62 0.18 275)" },
  { name: "Community", value: 18, color: "oklch(0.68 0.20 290)" },
  { name: "Operations", value: 16, color: "oklch(0.85 0.08 290)" },
];

const timelineLine = [
  { q: "Q1", plan: 20, actual: 18 },
  { q: "Q2", plan: 42, actual: 39 },
  { q: "Q3", plan: 60, actual: 55 },
  { q: "Q4", plan: 78, actual: null },
  { q: "Q5", plan: 92, actual: null },
  { q: "Q6", plan: 100, actual: null },
];

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: typeof Leaf;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-24"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h2>
      </div>
      <div className="glass rounded-3xl p-6 sm:p-8">{children}</div>
    </motion.section>
  );
}

function ReportPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Report · Rotterdam · Jul 2026"
        title="Urban flooding resilience plan"
        description="A multi-agent sustainability plan combining hydrological modelling, transit integration and citizen engagement, aligned with the UN SDGs."
        actions={
          <>
            <Button variant="outline" className="rounded-full"><Share2 className="mr-1.5 h-4 w-4" /> Share</Button>
            <Button variant="outline" className="rounded-full"><Braces className="mr-1.5 h-4 w-4" /> JSON</Button>
            <Button variant="outline" className="rounded-full"><FileDown className="mr-1.5 h-4 w-4" /> DOCX</Button>
            <Button className="rounded-full bg-gradient-to-r from-[oklch(0.42_0.22_285)] to-[oklch(0.55_0.24_285)] text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.42_0.22_285/0.7)]">
              <Download className="mr-1.5 h-4 w-4" /> Export PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-border/50 bg-background/60 p-4 backdrop-blur">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Contents
            </p>
            <nav className="space-y-1">
              {sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span className="font-numeric text-[10px] text-primary/60">{String(i + 1).padStart(2, "0")}</span>
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="flex flex-col gap-10">
          <Section id="summary" icon={FileText} title="Executive Summary">
            <p className="text-base leading-relaxed text-muted-foreground">
              Rotterdam faces a projected 34% increase in cloudburst intensity by 2035. This
              plan combines <span className="text-foreground">blue-green infrastructure</span>, an
              upgraded metro corridor, and neighbourhood-level microgrids to reduce flood exposure
              by an estimated 58% while cutting transit emissions by 42%.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {[
                { k: "Flood risk reduction", v: "58%" },
                { k: "CO₂ avoided / yr", v: "84 kt" },
                { k: "Estimated CAPEX", v: "€312M" },
                { k: "Payback", v: "9.4 yr" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-border/50 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{s.k}</p>
                  <p className="mt-1 font-display text-2xl tracking-tight">{s.v}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="sdg" icon={Target} title="Recommended SDGs">
            <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
              <div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The plan primarily advances <span className="text-foreground">SDG 11 (Sustainable Cities)</span>,{" "}
                  <span className="text-foreground">SDG 13 (Climate Action)</span> and{" "}
                  <span className="text-foreground">SDG 6 (Clean Water)</span>, with meaningful co-benefits
                  across SDG 9 and 15.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["6", "9", "11", "13", "15"].map((n) => (
                    <span key={n} className="inline-flex h-8 items-center rounded-full border border-primary/20 bg-primary/5 px-3 font-numeric text-xs text-primary">
                      SDG {n}
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer>
                  <BarChart data={sdgBars} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" vertical={false} />
                    <XAxis dataKey="sdg" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "oklch(0.55 0.24 285 / 0.06)" }} contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0 0)" }} />
                    <Bar dataKey="score" fill="oklch(0.55 0.24 285)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Section>

          <Section id="env" icon={Leaf} title="Environmental Analysis">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { k: "Impervious area removed", v: "42 ha", note: "Replaced by permeable surfaces" },
                { k: "Urban canopy added", v: "+18%", note: "Cooling & carbon sequestration" },
                { k: "Stormwater retained", v: "1.2M m³", note: "Peak-flow attenuation" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-border/50 p-5">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{s.k}</p>
                  <p className="mt-2 font-display text-3xl tracking-tight">{s.v}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="fin" icon={Wallet} title="Financial Analysis">
            <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={budgetPie} innerRadius={54} outerRadius={92} paddingAngle={4} dataKey="value">
                      {budgetPie.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0 0)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {budgetPie.map((e) => (
                  <div key={e.name} className="flex items-center gap-3 rounded-2xl border border-border/50 p-3">
                    <span className="h-3 w-3 rounded-full" style={{ background: e.color }} />
                    <span className="flex-1 text-sm">{e.name}</span>
                    <span className="font-numeric text-sm">{e.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section id="policy" icon={Scale} title="Policy Recommendations">
            <ul className="space-y-3 text-sm">
              {[
                "Amend zoning code to mandate permeable surfaces in all new commercial developments.",
                "Introduce a stormwater fee tied to impervious surface area, with rebates for green roofs.",
                "Align procurement with EU Green Deal Article 6 and CSRD ESRS E1 reporting requirements.",
                "Establish a citizen advisory board for neighbourhood-scale interventions.",
              ].map((p, i) => (
                <li key={i} className="flex gap-3 rounded-2xl border border-border/50 p-4">
                  <span className="font-numeric text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-muted-foreground">{p}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="risk" icon={ShieldAlert} title="Risk Analysis">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <tr><th className="pb-3 font-medium">Risk</th><th className="pb-3 font-medium">Likelihood</th><th className="pb-3 font-medium">Impact</th><th className="pb-3 font-medium">Mitigation</th></tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {[
                    { r: "Cost overrun", l: "Medium", i: "High", m: "Phased procurement with independent oversight" },
                    { r: "Public opposition", l: "Low", i: "Medium", m: "Early citizen engagement & co-design" },
                    { r: "Supply chain delay", l: "Medium", i: "Medium", m: "Dual-source critical components" },
                    { r: "Climate over-run", l: "High", i: "High", m: "Design to RCP 8.5 with adaptive margins" },
                  ].map((r) => (
                    <tr key={r.r}>
                      <td className="py-3 font-medium">{r.r}</td>
                      <td className="py-3"><Badge className="rounded-full bg-muted text-foreground/80">{r.l}</Badge></td>
                      <td className="py-3"><Badge className="rounded-full bg-primary/10 text-primary">{r.i}</Badge></td>
                      <td className="py-3 text-muted-foreground">{r.m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="timeline" icon={CalendarClock} title="Timeline">
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={timelineLine} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" vertical={false} />
                  <XAxis dataKey="q" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0 0)" }} />
                  <Line type="monotone" dataKey="plan" stroke="oklch(0.55 0.24 285)" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="actual" stroke="oklch(0.62 0.18 275)" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section id="reco" icon={Sparkles} title="Recommendations">
            <ol className="space-y-4">
              {[
                "Prioritise Phase 1 blue-green corridors along the Nieuwe Maas within 6 months.",
                "Launch a resident co-design program before Phase 2 procurement to reduce opposition risk.",
                "Bundle transit and stormwater investments to unlock EU Cohesion Fund co-financing.",
              ].map((r, i) => (
                <li key={i} className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-5">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-primary">Recommendation {i + 1}</p>
                  <p className="mt-2 text-sm text-foreground">{r}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="refs" icon={ExternalLink} title="References">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "IPCC AR7 Synthesis Report (2025)",
                "EU Green Deal — Consolidated (2026)",
                "Rotterdam Climate Adaptation Plan (2024)",
                "UN SDG 11 Municipal Case Studies (2025)",
              ].map((r) => (
                <li key={r} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  {r}
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}
