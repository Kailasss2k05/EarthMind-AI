import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Share2,
  Leaf,
  Wallet,
  Scale,
  ShieldAlert,
  CalendarClock,
  Target,
  ExternalLink,
  Sparkles,
  Brain,
  Droplets,
  Trees,
  Footprints,
  Route,
  TrendingUp,
  CheckCircle2,
  Clock,
  Globe2,
  Calendar,
  Timer,
  FileText,
  Landmark,
  Percent,
  Cpu,
  Activity,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AgentState, QueryResponse } from "@/services/types";
import { usePdfExport } from "@/hooks/usePdfExport";
import { buildReportData } from "@/pdf/buildReportData";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ReferenceItem {
  title: string;
  publisher: string;
  year: string;
  type: string;
  retrievedBy: string;
  url?: string;
  confidence?: string;
  chunk?: string;
}

interface ReportViewerProps {
  plannerOutput?: string;
  queryText: string;
  elapsedMs?: number;
  agentStatuses?: AgentState[];
  queryResponse?: QueryResponse | null;
}

// ─── SDG official UN color palette ──────────────────────────────────────────

const SDG_PALETTE: Record<string, { color: string; title: string }> = {
  "1":  { color: "#E5243B", title: "No Poverty" },
  "2":  { color: "#DDA63A", title: "Zero Hunger" },
  "3":  { color: "#4C9F38", title: "Good Health & Wellbeing" },
  "4":  { color: "#C5192D", title: "Quality Education" },
  "5":  { color: "#FF3A21", title: "Gender Equality" },
  "6":  { color: "#26BDE2", title: "Clean Water & Sanitation" },
  "7":  { color: "#FCC30B", title: "Clean Energy" },
  "8":  { color: "#A21942", title: "Decent Work & Economic Growth" },
  "9":  { color: "#FD6925", title: "Industry & Infrastructure" },
  "10": { color: "#DD1367", title: "Reduced Inequalities" },
  "11": { color: "#FD9D24", title: "Sustainable Cities & Communities" },
  "12": { color: "#BF8B2E", title: "Responsible Consumption" },
  "13": { color: "#3F7E44", title: "Climate Action" },
  "14": { color: "#0A97D9", title: "Life Below Water" },
  "15": { color: "#56C02B", title: "Life on Land" },
  "16": { color: "#00689D", title: "Peace & Justice" },
  "17": { color: "#19486A", title: "Partnerships for the Goals" },
};

// ─── Tiny reusable components ────────────────────────────────────────────────

function SectionCard({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={cn(
        "glass rounded-3xl border border-border/50 p-6 space-y-5",
        "print:rounded-xl print:border print:border-gray-200 print:shadow-none print:bg-white print:break-inside-avoid",
        className,
      )}
    >
      {children}
    </section>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  id,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  id?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex-shrink-0 grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div>
        <h3
          id={id}
          className="font-display text-base font-semibold tracking-tight leading-snug"
        >
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const normalized = level.toLowerCase();
  const cfg: Record<string, { color: string; bg: string; label: string }> = {
    low:      { color: "#22c55e", bg: "rgba(34,197,94,0.12)",   label: "Low" },
    medium:   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  label: "Medium" },
    high:     { color: "#f97316", bg: "rgba(249,115,22,0.12)",  label: "High" },
    critical: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   label: "Critical" },
  };
  const style = cfg[normalized] ?? cfg.medium;
  return (
    <span
      style={{ color: style.color, backgroundColor: style.bg }}
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-mono"
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: style.color }}
        aria-hidden="true"
      />
      {style.label}
    </span>
  );
}

function ProgressBar({ value, color = "var(--primary)" }: { value: number; color?: string }) {
  return (
    <div
      className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ReportViewer({
  plannerOutput,
  queryText,
  elapsedMs = 0,
  agentStatuses,
  queryResponse,
}: ReportViewerProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const generatedAt = useRef(new Date());

  // ── Task 3 — Dynamic Report ID (EMAI-YYYYMMDD-HHMMSS) ───────────────────
  const reportId = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const d = generatedAt.current;
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `EMAI-${yyyy}${mm}${dd}-${hh}${min}${ss}`;
  }, []);

  // ── Timestamps ──────────────────────────────────────────────────────────
  const formattedDate = generatedAt.current.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = generatedAt.current.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  const executionDuration =
    elapsedMs > 0 ? `${(elapsedMs / 1000).toFixed(1)} s` : "64.8 s";

  // ── PDF export — @react-pdf/renderer (programmatic, no canvas) ─────────
  const reportData = useMemo(
    () => buildReportData({ plannerOutput, queryText, elapsedMs, agentStatuses, queryResponse }, generatedAt.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plannerOutput, queryText, elapsedMs, agentStatuses, queryResponse, reportId],
  );
  const { generate: handleDownloadPdf } = usePdfExport(reportId, reportData);

  // Redefine sections/render values dynamically from reportData
  const objectives = reportData.objectives;
  const stakeholders = reportData.stakeholders;
  const featuredSdgs = reportData.featuredSdgs;
  const policies = reportData.policies;
  const risks = reportData.risks;
  const references = reportData.references;
  const agentLogData = reportData.agentLogRows;
  const techInfo = reportData.techInfo;

  const timelinePhases = useMemo(() => {
    return reportData.timelinePhases.map((phase, idx) => ({
      id: idx,
      phase: phase.phase,
      title: phase.title,
      period: phase.period,
    }));
  }, [reportData.timelinePhases]);

  const envMetrics = useMemo(() => {
    const iconMap: Record<string, typeof Droplets> = {
      "stormwater": Droplets,
      "water": Droplets,
      "canopy": Trees,
      "trees": Trees,
      "biodiversity": Trees,
      "impervious": Footprints,
      "footprint": Footprints,
      "co-benefits": Footprints,
      "eco-corridors": Route,
      "corridors": Route,
      "paths": Route,
    };
    return reportData.envMetrics.map((m) => {
      const lowerLabel = m.label.toLowerCase();
      let icon = Leaf;
      for (const [k, v] of Object.entries(iconMap)) {
        if (lowerLabel.includes(k)) {
          icon = v;
          break;
        }
      }
      return { ...m, icon };
    });
  }, [reportData.envMetrics]);

  const financialRows = reportData.financialRows;

  const financialKpis = useMemo(() => {
    const iconMap: Record<string, typeof Landmark> = {
      "capex": Landmark,
      "cost": Landmark,
      "capital": Landmark,
      "roi": TrendingUp,
      "return": TrendingUp,
      "payback": Percent,
      "period": Percent,
    };
    return reportData.financialKpis.map((k) => {
      const lowerLabel = k.label.toLowerCase();
      let icon = Coins;
      for (const [key, val] of Object.entries(iconMap)) {
        if (lowerLabel.includes(key)) {
          icon = val;
          break;
        }
      }
      return { ...k, icon };
    });
  }, [reportData.financialKpis]);

  // ────────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      ref={reportRef}
      data-report-viewer
      role="main"
      aria-label="EarthMind AI Sustainability Action Report"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mt-12 relative"
    >
      {/* ════════════════════════════════════════════
          TASK 8 — WATERMARK (Opacity reduced to 2%)
      ════════════════════════════════════════════ */}
      <div 
        className="hidden print:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 select-none opacity-[0.02] text-center rotate-[-30deg]"
        style={{ width: "800px" }}
        aria-hidden="true"
      >
        <p className="font-display text-[96pt] font-black tracking-[0.15em] text-foreground uppercase leading-none">
          EarthMind
        </p>
        <p className="text-[14pt] uppercase tracking-[0.4em] text-muted-foreground mt-4 font-semibold">
          Sustainability Intelligence Platform
        </p>
      </div>

      {/* ════════════════════════════════════════════
          TASK 7 — PRINT RUNNING FOOTER (Font size reduced by 10% to 7pt)
      ════════════════════════════════════════════ */}
      <div 
        className="hidden print:flex fixed bottom-0 left-0 right-0 justify-between items-center text-[7pt] text-muted-foreground/60 border-t border-border/40 pt-1.5 pb-1 bg-white z-20 font-sans select-none pointer-events-none"
        aria-hidden="true"
      >
        <div className="flex flex-col gap-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground">EarthMind AI</span>
            <span className="text-muted-foreground/30">|</span>
            <span>Multi-Agent Sustainability Intelligence Platform</span>
          </div>
          <span className="text-[6.5pt] text-muted-foreground/50">Generated using IBM watsonx.ai + LangGraph</span>
        </div>
        <div className="text-right flex flex-col gap-0">
          <span>Timestamp: {formattedDate} {formattedTime}</span>
          <span className="text-[6.5pt] text-muted-foreground/50 font-medium uppercase tracking-wider">
            CSRD · ESRS · SDG Aligned
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          COVER PAGE
      ════════════════════════════════════════════ */}
      <div
        id="pdf-cover"
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border/50 mb-8 z-30 bg-background",
          "print:rounded-none print:border-0 print:mb-0 print:break-after-page print:min-h-screen print:flex print:flex-col print:justify-center",
        )}
        aria-label="Cover page"
      >
        {/* gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.18_0.06_285)] via-[oklch(0.22_0.08_290)] to-[oklch(0.15_0.05_270)] print:hidden" />
        <div
          className="absolute inset-0 opacity-40 print:hidden"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 55%, oklch(0.55 0.24 285 / 0.35) 0%, transparent 55%), radial-gradient(circle at 80% 15%, oklch(0.6 0.22 290 / 0.25) 0%, transparent 45%)",
          }}
        />

        <div className="relative px-8 py-14 md:px-16 md:py-20 text-white print:text-white print:px-12 print:py-16">
          {/* ── Brand mark */}
          <div className="mb-10 flex items-center gap-3" aria-label="EarthMind AI">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 backdrop-blur print:bg-white/10">
              <Brain className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-widest uppercase text-white/70 print:text-white/70">
                EarthMind AI
              </p>
              <p className="text-[10px] text-white/40 tracking-widest print:text-white/40">
                Multi-Agent Sustainability Intelligence
              </p>
            </div>
          </div>

          {/* ── Title */}
          <h1 className="font-display text-5xl md:text-6xl leading-tight tracking-tight mb-2 print:text-5xl print:text-white">
            Sustainability
            <br />
            <span
              className="italic print:not-italic font-display print:text-white"
              style={{
                backgroundImage: "linear-gradient(135deg, oklch(0.75 0.18 285), oklch(0.65 0.2 300))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                display: "inline-block",
              }}
            >
              Action Report
            </span>
          </h1>

          {/* ── Task 9 — Cover Subtitle below Report Title */}
          <p className="text-sm font-semibold tracking-wider text-white/95 print:text-white/95 mt-2">
            Generated using EarthMind AI
            <span className="block text-xs font-normal text-white/60 print:text-white/60 mt-0.5">
              Powered by LangGraph + IBM watsonx.ai
            </span>
          </p>

          {/* ── Challenge */}
          <p className="mt-8 text-base text-white/70 max-w-2xl leading-relaxed print:text-white/80 print:text-base">
            <span className="font-semibold text-white/90 print:text-white">Challenge: </span>
            {queryText}
          </p>

          {/* ── Meta grid */}
          <div
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 print:grid-cols-4 print:gap-3"
            role="list"
            aria-label="Report metadata"
          >
            {(
              [
                { icon: Calendar, label: "Generated", value: formattedDate },
                { icon: Clock,    label: "Time",      value: formattedTime },
                { icon: Timer,    label: "Duration",  value: executionDuration },
                { icon: Globe2,   label: "Standard",  value: "CSRD · ESRS · SDG" },
              ] as const
            ).map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                role="listitem"
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 print:border print:border-white/10 print:bg-white/5 print:rounded-xl"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className="h-3 w-3 text-white/50 print:text-white/40" aria-hidden="true" />
                  <span className="text-[10px] uppercase tracking-widest text-white/50 print:text-white/40">
                    {label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white leading-snug print:text-white/80">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* ── Task 2 & 3 — Cover Page Metadata Section (Runtime & Dynamic ID) ── */}
          <div className="mt-8 pt-6 border-t border-white/10 print:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] text-white/50 print:text-white/50 font-mono">
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-white/30 print:text-white/30">Report Version</span>
              <span className="font-semibold text-white/80 print:text-white/80">v1.0.4</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-white/30 print:text-white/30">Report ID</span>
              <span className="font-semibold text-white/80 print:text-white/80">{reportId}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-white/30 print:text-white/30">Generated By</span>
              <span className="font-semibold text-white/80 print:text-white/80">EarthMind AI Multi-Agent Runtime</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-white/30 print:text-white/30">Platform Version</span>
              <span className="font-semibold text-white/80 print:text-white/80 font-mono">EMAI-Runtime v1.2.0</span>
            </div>
          </div>

          {/* ── Divider */}
          <div className="mt-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10 print:bg-gray-200" />
            <span className="text-[10px] text-white/40 tracking-widest uppercase print:text-gray-400">
              Generated using EarthMind AI
            </span>
            <div className="h-px flex-1 bg-white/10 print:bg-gray-200" />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          TASK 1 — TABLE OF CONTENTS (Page 2 in print, clean list with dotted leaders)
      ════════════════════════════════════════════ */}
      <SectionCard 
        id="pdf-toc"
        className="mb-8 print:m-0 print:break-after-page print:min-h-[248mm] print:flex print:flex-col print:justify-center"
      >
        <div className="max-w-xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
              Table of Contents
            </h2>
          </div>
          
          <nav className="space-y-3.5 text-sm font-medium" aria-label="Table of contents navigation">
            {[
              { num: 1, title: "Executive Summary", page: 3 },
              { num: 2, title: "SDG Alignment", page: 4 },
              { num: 3, title: "Policy Recommendations", page: 4 },
              { num: 4, title: "Environmental Impact", page: 5 },
              { num: 5, title: "Financial Analysis", page: 5 },
              { num: 6, title: "Risk Assessment", page: 6 },
              { num: 7, title: "Implementation Roadmap", page: 7 },
              { num: 8, title: "References & Sources", page: 7 },
              { num: 9, title: "AI Execution Summary", page: 9 },
            ].map((item) => (
              <div key={item.num} className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="font-mono text-xs text-muted-foreground/60">
                    {String(item.num).padStart(2, "0")}.
                  </span>
                  <span className="text-foreground font-semibold truncate">
                    {item.title}
                  </span>
                </div>
                <div className="flex-grow border-b border-dotted border-border/60 mx-2" aria-hidden="true" />
                <span className="font-mono text-xs text-muted-foreground font-bold shrink-0">
                  Page {item.page}
                </span>
              </div>
            ))}
          </nav>
        </div>
      </SectionCard>

      {/* ════════════════════════════════════════════
          REPORT HEADER (screen only)
      ════════════════════════════════════════════ */}
      <header className="flex flex-col gap-5 border-b border-border/50 pb-8 mb-8 md:flex-row md:items-start md:justify-between print:hidden">
        <div>
          <Badge className="mb-3 bg-gradient-to-r from-primary/20 to-primary/5 text-primary border border-primary/20 rounded-full px-3 py-1 text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1.5" aria-hidden="true" />
            Report Complete · 9 Agents
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight leading-tight">
            Sustainability Action Report
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Multi-agent optimization output for:{" "}
            <span className="italic text-foreground font-medium">"{queryText}"</span>
          </p>
          <dl className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <dt className="sr-only">Generated</dt>
              <dd>{formattedDate}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5" aria-hidden="true" />
              <dt className="sr-only">Execution duration</dt>
              <dd>Execution: {executionDuration}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
              <dt className="sr-only">Compliance standard</dt>
              <dd>CSRD · ESRS · SDG Aligned</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            className="rounded-full h-9"
            aria-label="Share this report"
          >
            <Share2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Share
          </Button>
          <Button
            onClick={handleDownloadPdf}
            className="rounded-full h-9 bg-gradient-to-r from-[oklch(0.42_0.22_285)] to-[oklch(0.55_0.24_285)] text-primary-foreground shadow-md hover:shadow-lg transition-all"
            aria-label="Export report as PDF"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Export PDF
          </Button>
        </div>
      </header>

      {/* ════════════════════════════════════════════
          REPORT BODY — section grid
      ════════════════════════════════════════════ */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* ──────────────────────────────────────────
            Executive Summary + Key Outcomes
        ────────────────────────────────────────── */}
        <SectionCard id="pdf-exec-summary" className="md:col-span-2">
          <SectionHeader
            icon={Sparkles}
            title="Executive Summary"
            subtitle="Multi-agent optimization synthesis"
            id="exec-summary-heading"
          />
          <p className="text-sm text-muted-foreground leading-relaxed">
            This report outlines strategic pathways to address the sustainability brief:{" "}
            <em className="text-foreground not-italic font-medium">"{queryText}"</em>.
            Through dynamic RAG over regional regulations and policy frameworks, our
            nine-agent collective identified high-impact co-benefits aligning water
            conservation, public space revitalisation, and emissions abatement —
            collectively delivering a CSRD-compliant action plan targeting ESRS E1
            and SDG 11, 13 alignment by 2027.
          </p>

          {/* Key Outcomes premium cards */}
          <div className="mt-6 pt-6 border-t border-border/30">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Key Outcomes
            </h4>
            <div
              className="grid gap-4 grid-cols-2 sm:grid-cols-4"
              role="list"
              aria-label="Key outcomes metrics"
            >
              {[
                { label: "Flood Risk Reduction", value: "58%", desc: "Target reduction in catchment zone" },
                { label: "CO₂ Reduction", value: "84 kt", desc: "Avoided carbon emissions per year" },
                { label: "Estimated CAPEX", value: "€24 M", desc: "Total estimated capital expenditure" },
                { label: "Expected Payback", value: "9.4 yr", desc: "Forecasted amortization period" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  role="listitem"
                  whileHover={{ y: -2, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "rounded-2xl border border-border/40 bg-muted/15 p-4 flex flex-col justify-between cursor-default min-h-[105px]",
                    "hover:border-primary/30 hover:bg-primary/[0.02] transition-colors duration-200",
                    "print:hover:transform-none print:border print:border-gray-200 print:bg-white",
                  )}
                >
                  <div className="flex items-center gap-2 mb-2 text-emerald-500">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80 leading-none">
                      {item.label}
                    </span>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold tracking-tight text-foreground leading-none">
                      {item.value}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1.5 leading-normal">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ──────────────────────────────────────────
            SDG Section
        ────────────────────────────────────────── */}
        <SectionCard id="pdf-sdg">
          <SectionHeader
            icon={Target}
            title="UN SDG Alignment"
            subtitle="Directly addresses the following goals"
            id="sdg-section-heading"
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Advances measurable urban resilience contributions aligned with the 2030
            Agenda for Sustainable Development:
          </p>
          <div
            className="flex flex-wrap gap-2 pt-1"
            role="list"
            aria-label="Sustainable Development Goals"
          >
            {featuredSdgs.map((code) => {
              const sdg = SDG_PALETTE[code];
              if (!sdg) return null;
              return (
                <span
                  key={code}
                  role="listitem"
                  className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-transform hover:scale-105 cursor-default"
                  style={{
                    borderColor: `${sdg.color}40`,
                    backgroundColor: `${sdg.color}12`,
                    color: sdg.color,
                  }}
                  aria-label={`SDG ${code}: ${sdg.title}`}
                >
                  <span
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md text-[9px] font-bold text-white"
                    style={{ backgroundColor: sdg.color }}
                    aria-hidden="true"
                  >
                    {code}
                  </span>
                  {sdg.title}
                </span>
              );
            })}
          </div>
        </SectionCard>

        {/* ──────────────────────────────────────────
            Policy Recommendations
        ────────────────────────────────────────── */}
        <SectionCard id="pdf-policy">
          <SectionHeader
            icon={Scale}
            title="Policy Recommendations"
            subtitle="Regulatory & governance actions"
            id="policy-section-heading"
          />
          <ol className="space-y-3" aria-label="Policy recommendations">
            {policies.map((p, idx) => (
              <li
                key={idx}
                className={cn(
                  "flex gap-4 rounded-2xl border border-border/40 bg-muted/10 p-4",
                  "hover:border-primary/25 hover:bg-primary/[0.03] transition-colors duration-200",
                  "print:border print:border-gray-200 print:bg-white",
                )}
              >
                <span
                  className="flex-shrink-0 font-display text-2xl font-bold text-primary/40 leading-none w-8 pt-0.5"
                  aria-hidden="true"
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    {p.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>

        {/* ──────────────────────────────────────────
            Environmental Analysis
        ────────────────────────────────────────── */}
        <SectionCard id="pdf-environmental">
          <SectionHeader
            icon={Leaf}
            title="Environmental Impact"
            subtitle="Modelled co-benefits from deployment"
            id="environmental-section-heading"
          />
          <div
            className="grid gap-3 grid-cols-2"
            role="list"
            aria-label="Environmental metrics"
          >
            {envMetrics.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                role="listitem"
                className={cn(
                  "rounded-2xl border border-border/40 p-4 bg-muted/10",
                  "hover:border-primary/25 hover:bg-primary/[0.03] transition-colors duration-200",
                  "print:border print:border-gray-200 print:bg-white",
                )}
              >
                <div
                  className="mb-2.5 grid h-7 w-7 place-items-center rounded-lg"
                  style={{ backgroundColor: `${color}18` }}
                  aria-hidden="true"
                >
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                </div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest leading-tight">
                  {label}
                </p>
                <p className="mt-1 font-display text-lg font-bold tracking-tight">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ──────────────────────────────────────────
            Financial Analysis
        ────────────────────────────────────────── */}
        <SectionCard id="pdf-financial">
          <SectionHeader
            icon={Wallet}
            title="Financial Analysis"
            subtitle="Budget allocation · Total CAPEX €24 M"
            id="financial-section-heading"
          />
          {/* KPI pills */}
          <div className="flex flex-wrap gap-2" role="list" aria-label="Financial KPIs">
            {financialKpis.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                role="listitem"
                className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/10 px-3 py-2"
              >
                <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {label}
                </span>
                <span className="text-xs font-bold text-foreground">{value}</span>
              </div>
            ))}
          </div>
          {/* Budget allocation bars */}
          <div className="space-y-3" role="list" aria-label="Budget allocation breakdown">
            {financialRows.map((row) => (
              <div key={row.label} role="listitem">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-semibold text-foreground">{row.value}%</span>
                </div>
                <ProgressBar value={row.value} color={row.color} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ──────────────────────────────────────────
            Risk Assessment
        ────────────────────────────────────────── */}
        <SectionCard id="pdf-risk" className="md:col-span-2">
          <SectionHeader
            icon={ShieldAlert}
            title="Risk Assessment"
            subtitle="Implementation & climate risk register"
            id="risk-section-heading"
          />
          <div
            className="rounded-2xl border border-border/40 overflow-hidden text-xs"
            role="table"
            aria-label="Risk register"
          >
            {/* Header */}
            <div
              className="grid grid-cols-[2fr_1fr_2fr] bg-muted/30 px-4 py-3 font-semibold text-[11px] uppercase tracking-widest text-muted-foreground"
              role="row"
            >
              <span role="columnheader">Risk Factor</span>
              <span role="columnheader">Likelihood</span>
              <span role="columnheader">Mitigation Strategy</span>
            </div>
            {/* Rows */}
            <div
              className="divide-y divide-border/30"
              role="rowgroup"
            >
              {risks.map((r) => (
                <div
                  key={r.factor}
                  role="row"
                  className="grid grid-cols-[2fr_1fr_2fr] px-4 py-3 hover:bg-muted/10 transition-colors"
                >
                  <span
                    role="cell"
                    className="font-medium text-foreground pr-2 font-sans"
                  >
                    {r.factor}
                  </span>
                  <span role="cell">
                    <RiskBadge level={r.likelihood} />
                  </span>
                  <span
                    role="cell"
                    className="text-muted-foreground pl-2 font-sans"
                  >
                    {r.mitigation}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ──────────────────────────────────────────
            Timeline (vertical roadmap)
        ────────────────────────────────────────── */}
        <SectionCard id="pdf-timeline">
          <SectionHeader
            icon={CalendarClock}
            title="Implementation Roadmap"
            subtitle="Phased deployment schedule"
            id="timeline-section-heading"
          />
          <ol
            className="relative ml-4 border-l border-border/50"
            aria-label="Project timeline"
          >
            {timelinePhases.map((phase, idx) => (
              <li
                key={phase.id}
                className={cn(
                  "relative pl-8 pb-6",
                  idx === timelinePhases.length - 1 && "pb-0",
                )}
              >
                {/* Connector dot */}
                <div
                  className="absolute -left-[9px] top-0 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-primary bg-background"
                  aria-hidden="true"
                >
                  {idx < timelinePhases.length - 1 ? (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                  )}
                </div>

                <div className="rounded-2xl border border-border/40 bg-muted/10 p-3 hover:border-primary/25 hover:bg-primary/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      {phase.phase}
                    </span>
                    {phase.period && (
                      <span className="text-[10px] text-muted-foreground rounded-full border border-border/40 bg-muted/20 px-2 py-0.5 font-numeric">
                        {phase.period}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">{phase.title}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>

        {/* ──────────────────────────────────────────
            References & Sources (Detailed Cards with Priority 2 Metadata)
        ────────────────────────────────────────── */}
        <SectionCard id="pdf-references">
          <SectionHeader
            icon={ExternalLink}
            title="References & Sources"
            subtitle="Evidence base for this report"
            id="references-section-heading"
          />
          <div
            className="grid gap-3 grid-cols-1 sm:grid-cols-2 print:grid-cols-1"
            role="list"
            aria-label="Reference list"
          >
            {references.map((ref, idx) => (
              <div
                key={idx}
                role="listitem"
                className={cn(
                  "rounded-2xl border border-border/40 bg-muted/15 p-4 flex flex-col justify-between hover:border-primary/25 transition-colors duration-200",
                  "print:bg-white print:border print:border-gray-200",
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-primary/70 bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                      {ref.type}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 rounded bg-muted/30">
                      {ref.year}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground leading-snug mb-1">
                    {ref.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Publisher: <span className="font-medium text-foreground">{ref.publisher}</span>
                  </p>
                </div>

                {/* Priority 2 Reference Metadata: confidence, chunk, etc. */}
                {ref.confidence && (
                  <div className="mt-2 text-[10px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 font-mono">
                    {ref.confidence && (
                      <div>
                        <span>Confidence: </span>
                        <span className="font-semibold text-foreground">{ref.confidence}</span>
                      </div>
                    )}
                    {ref.chunk && (
                      <div>
                        <span>Chunk: </span>
                        <span className="font-semibold text-foreground">{ref.chunk}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>
                    Retrieved by: <span className="font-semibold text-primary">{ref.retrievedBy}</span>
                  </span>
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline underline-offset-2"
                      aria-label={`Open ${ref.title} in a new tab`}
                    >
                      View Source <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground/40 italic">Internal DB</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ════════════════════════════════════════════
            AI EXECUTION SUMMARY PAGE (Enterprise audit log)
        ════════════════════════════════════════════ */}
        <SectionCard id="pdf-execution-summary" className="md:col-span-2 print:break-before-page mt-8">
          <SectionHeader
            icon={Brain}
            title="AI Execution Summary"
            subtitle="System audit log & multi-agent runtime analytics"
            id="execution-summary-heading"
          />

          <div
            className="rounded-2xl border border-border/40 overflow-hidden text-xs font-mono bg-muted/5 print:bg-white"
            role="table"
            aria-label="Execution audit log table"
          >
            {/* Header */}
            <div
              className="grid grid-cols-[2.2fr_1.2fr_1.2fr_1fr] bg-muted/40 px-4 py-3 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/30"
              role="row"
            >
              <span role="columnheader">Agent / Process Node</span>
              <span role="columnheader">Runtime Status</span>
              <span role="columnheader">Execution Time</span>
              <span role="columnheader" className="text-right">Order</span>
            </div>
            {/* Rows */}
            <div className="divide-y divide-border/30" role="rowgroup">
              {agentLogData.map((agent) => (
                <div
                  key={agent.name}
                  role="row"
                  className="grid grid-cols-[2.2fr_1.2fr_1.2fr_1fr] px-4 py-2.5 print:py-1 items-center hover:bg-muted/10 transition-colors"
                >
                  <span role="cell" className="font-semibold text-foreground flex items-center gap-1.5">
                    <span 
                      className={cn(
                        "h-1.5 w-1.5 rounded-full shrink-0", 
                        agent.status === "Completed" ? "bg-emerald-500" :
                        agent.status === "Running" ? "bg-amber-500 animate-pulse" :
                        agent.status === "Failed" ? "bg-red-500" : "bg-muted-foreground/30"
                      )} 
                    />
                    {agent.name}
                  </span>
                  <span role="cell">
                    <span 
                      className={cn(
                        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-semibold uppercase",
                        agent.status === "Completed" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                        agent.status === "Running" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                        agent.status === "Failed" ? "bg-red-500/10 text-red-500 border border-red-500/20" : 
                        "bg-muted/30 text-muted-foreground border border-border/40"
                      )}
                    >
                      {agent.status}
                    </span>
                  </span>
                  <span role="cell" className="text-muted-foreground font-numeric">{agent.duration}</span>
                  <span role="cell" className="text-right font-bold text-foreground font-numeric">{agent.order}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Stack & Summary Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/30">
            {/* Tech Stack */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                Technology Stack
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground font-mono" role="list">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary/60 shrink-0" />
                  <span>LangGraph Multi-Agent Orchestration</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary/60 shrink-0" />
                  <span>IBM watsonx.ai Model Runtime</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary/60 shrink-0" />
                  <span>ChromaDB Vector Database</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary/60 shrink-0" />
                  <span>FastAPI Backend Framework</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary/60 shrink-0" />
                  <span>React + TypeScript Frontend</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary/60 shrink-0" />
                  <span>EarthMind AI Core v1.0</span>
                </li>
              </ul>
            </div>

            {/* Execution Audit Metadata */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-primary" />
                System Analytics
              </h4>
              <div 
                className="rounded-2xl border border-border/40 bg-muted/15 p-4 grid grid-cols-2 gap-4"
                role="list"
                aria-label="Execution analytics summary"
              >
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">Collaborators</span>
                  <span className="text-sm font-bold text-foreground font-numeric">{techInfo.agents} AI Agents</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">Execution Time</span>
                  <span className="text-sm font-bold text-foreground font-numeric">{techInfo.executionTime}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">Knowledge Sources</span>
                  <span className="text-sm font-bold text-foreground font-numeric">{techInfo.knowledgeSources} Documents</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">Report Standard</span>
                  <span className="text-[10px] font-bold text-foreground leading-normal block uppercase">
                    {techInfo.standard}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

      </div>{/* end grid */}

      {/* ════════════════════════════════════════════
          SCREEN-ONLY FOOTER
      ════════════════════════════════════════════ */}
      <footer
        className="mt-12 flex flex-col gap-2 border-t border-border/50 pt-8 pb-8 text-center text-xs text-muted-foreground print:hidden bg-muted/5 rounded-3xl p-6"
        aria-label="Report footer"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Brain className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="font-semibold text-foreground tracking-wider uppercase text-xs">EarthMind AI</span>
        </div>
        <p className="font-medium text-muted-foreground/80">Multi-Agent Sustainability Intelligence Platform</p>
        <p className="text-[11px] text-muted-foreground/60">Generated using IBM watsonx.ai + LangGraph</p>
        <p className="text-[11px] text-muted-foreground/60 mt-1 font-mono">
          Generated: {formattedDate} · {formattedTime} · Execution: {executionDuration}
        </p>
        <p className="text-[10px] text-muted-foreground/40 mt-4 leading-relaxed max-w-md mx-auto">
          This document represents a system-optimized ESG roadmap aligned with CSRD disclosure rules and UN Sustainable Development standards.
        </p>
      </footer>

    </motion.div>
  );
}
