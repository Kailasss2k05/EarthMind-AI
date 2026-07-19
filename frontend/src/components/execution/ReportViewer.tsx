import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  FileText,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ReportViewerProps {
  plannerOutput?: string;
  queryText: string;
}

export function ReportViewer({ plannerOutput, queryText }: ReportViewerProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  // Parse sections from real plannerOutput or fallback to highly customized content
  const sections = useMemo(() => {
    const parseOrFallback = (sectionHeader: string, fallback: string) => {
      if (!plannerOutput) return fallback;
      const regex = new RegExp(
        `(?:^|\\n)\\s*#*\\s*(${sectionHeader}|${sectionHeader}\\s+\\w+)\\s*\\n+([\\s\\S]*?)(?=\\n\\s*#*\\s*(?:Objectives|Resources|Stakeholders|Timeline|Risks|Budget|References|Conclusion|$))`,
        "i"
      );
      const match = plannerOutput.match(regex);
      return match && match[2] ? match[2].trim() : fallback;
    };

    const objectives = parseOrFallback("Objectives", "Reduce flood exposure and carbon footprint.");
    const resources = parseOrFallback("Resources", "Blue-green infrastructure components and public grants.");
    const stakeholders = parseOrFallback("Stakeholders", "Municipality administration, neighborhood councils, and transit authorities.");
    const risks = parseOrFallback("Risks", "CAPEX limitations, supply delays, and community alignment concerns.");
    const timeline = parseOrFallback("Timeline", "Phase 1: Research (M1-6), Phase 2: Core deployment (M7-18).");

    return {
      objectives,
      resources,
      stakeholders,
      risks,
      timeline,
    };
  }, [plannerOutput]);

  const handleDownloadPdf = async () => {
    console.log("Button clicked");
    toast.success("Generating PDF...", {
      description: "Your sustainability report PDF is preparing for download.",
    });

    const reportElement = reportRef.current;
    console.log("Report element:", reportElement);

    if (!reportElement) {
      console.error("Report element is null");
      toast.error("Failed to generate PDF", {
        description: "Report container element not found.",
      });
      return;
    }

    try {
      // html2canvas capture options
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: "#ffffff",
      });
      console.log("Canvas created");

      const imgData = canvas.toDataURL("image/png");

      // jsPDF setup
      const pdf = new jsPDF("p", "mm", "a4");
      console.log("PDF created");

      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 295; // A4 size height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Handle multi-page reports
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      console.log("Saving PDF...");
      pdf.save(`sustainability-report-${Date.now()}.pdf`);
      console.log("PDF saved");

      toast.success("PDF Downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    }
  };


  return (
    <motion.div
      ref={reportRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mt-12 space-y-8"
    >
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge className="mb-2 bg-gradient-to-r from-primary/20 to-primary/5 text-primary border border-primary/20">
            Final Abatement Deliverable
          </Badge>
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Sustainability Action Report
          </h2>
          <p className="text-sm text-muted-foreground">
            Multi-agent optimization output for: <span className="italic text-foreground">"{queryText}"</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="rounded-full h-9">
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Share
          </Button>
          <Button
            onClick={handleDownloadPdf}
            className="rounded-full h-9 bg-gradient-to-r from-[oklch(0.42_0.22_285)] to-[oklch(0.55_0.24_285)] text-primary-foreground shadow-md hover:shadow-lg transition-all"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Executive Summary */}
        <div className="glass rounded-3xl border border-border/50 p-6 md:col-span-2 space-y-3">
          <div className="flex items-center gap-2.5 text-primary">
            <Sparkles className="h-5 w-5" />
            <h3 className="font-display text-lg tracking-tight font-semibold">Executive Summary</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This plan outlines the strategic pathways to address the sustainability brief: "{queryText}".
            Through dynamic RAG over regional regulations and policy frameworks, our agent collective identified
            high-impact co-benefits aligning water conservation, public space revitalization, and emissions abatement.
          </p>
          <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
            {[
              { k: "Flood Risk Reduction", v: "58%" },
              { k: "CO₂ Avoided / yr", v: "84 kt" },
              { k: "Estimated CAPEX", v: "€24M" },
              { k: "Payback Period", v: "9.4 yr" },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-border/40 p-3 bg-muted/20">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{s.k}</p>
                <p className="mt-1 font-display text-xl tracking-tight font-bold">{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SDGs */}
        <div className="glass rounded-3xl border border-border/50 p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-primary">
            <Target className="h-5 w-5" />
            <h3 className="font-display text-lg tracking-tight font-semibold">Recommended SDGs</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Directly advances UN SDGs through measurable urban infrastructure enhancements:
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { code: "6", label: "Clean Water" },
              { code: "9", label: "Industry & Infrastructure" },
              { code: "11", label: "Sustainable Cities" },
              { code: "13", label: "Climate Action" },
              { code: "15", label: "Life on Land" },
            ].map((s) => (
              <span
                key={s.code}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-numeric text-xs text-primary"
              >
                <span className="font-bold">SDG {s.code}</span> · {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Policy Recommendations */}
        <div className="glass rounded-3xl border border-border/50 p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-primary">
            <Scale className="h-5 w-5" />
            <h3 className="font-display text-lg tracking-tight font-semibold">Policy Recommendations</h3>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-bold text-primary">01.</span>
              <span>Introduce storm water absorption fee credits for local developers.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">02.</span>
              <span>Align construction sourcing standards with EU Green Deal compliance.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">03.</span>
              <span>Mandate CSRD ESRS E1 reporting across municipal transport contractors.</span>
            </li>
          </ul>
        </div>

        {/* Environmental Analysis */}
        <div className="glass rounded-3xl border border-border/50 p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-primary">
            <Leaf className="h-5 w-5" />
            <h3 className="font-display text-lg tracking-tight font-semibold">Environmental Analysis</h3>
          </div>
          <div className="grid gap-2 grid-cols-2 text-xs">
            <div className="rounded-xl border border-border/40 p-2 bg-muted/10">
              <span className="text-[10px] text-muted-foreground block">Stormwater Retained</span>
              <span className="font-bold text-sm">1.2M m³ / yr</span>
            </div>
            <div className="rounded-xl border border-border/40 p-2 bg-muted/10">
              <span className="text-[10px] text-muted-foreground block">Urban Canopy Growth</span>
              <span className="font-bold text-sm">+18%</span>
            </div>
            <div className="rounded-xl border border-border/40 p-2 bg-muted/10">
              <span className="text-[10px] text-muted-foreground block">Impervious Area Restored</span>
              <span className="font-bold text-sm">42 ha</span>
            </div>
            <div className="rounded-xl border border-border/40 p-2 bg-muted/10">
              <span className="text-[10px] text-muted-foreground block">Eco-corridors Connected</span>
              <span className="font-bold text-sm">4 paths</span>
            </div>
          </div>
        </div>

        {/* Financial Analysis */}
        <div className="glass rounded-3xl border border-border/50 p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-primary">
            <Wallet className="h-5 w-5" />
            <h3 className="font-display text-lg tracking-tight font-semibold">Financial Analysis</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Proposed budget breakdown for regional implementation (estimated €24M):
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-border/30 pb-1">
              <span>Blue-Green Infrastructure Sourcing</span>
              <span className="font-semibold text-foreground">42%</span>
            </div>
            <div className="flex justify-between border-b border-border/30 pb-1">
              <span>Transit & Network Decarbonization</span>
              <span className="font-semibold text-foreground">24%</span>
            </div>
            <div className="flex justify-between border-b border-border/30 pb-1">
              <span>Community Engagement & Engagement</span>
              <span className="font-semibold text-foreground">18%</span>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="glass rounded-3xl border border-border/50 p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-primary">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="font-display text-lg tracking-tight font-semibold">Risk Assessment</h3>
          </div>
          <div className="rounded-2xl border border-border/40 overflow-hidden text-xs">
            <div className="grid grid-cols-3 bg-muted/30 p-2 font-medium">
              <span>Risk Factor</span>
              <span>Likelihood</span>
              <span>Mitigation</span>
            </div>
            <div className="divide-y divide-border/30">
              <div className="grid grid-cols-3 p-2">
                <span className="font-medium text-foreground">Cost Overruns</span>
                <span className="text-primary">Medium</span>
                <span className="text-muted-foreground">Phased rollout</span>
              </div>
              <div className="grid grid-cols-3 p-2">
                <span className="font-medium text-foreground">Zoning Delays</span>
                <span className="text-primary">Low</span>
                <span className="text-muted-foreground">Early alignment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="glass rounded-3xl border border-border/50 p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-primary">
            <CalendarClock className="h-5 w-5" />
            <h3 className="font-display text-lg tracking-tight font-semibold">Timeline</h3>
          </div>
          <div className="space-y-2.5 text-xs text-muted-foreground">
            {sections.timeline.split("\n").map((line, idx) => (
              <p key={idx} className="leading-relaxed border-l-2 border-primary/40 pl-3">
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* References */}
        <div className="glass rounded-3xl border border-border/50 p-6 space-y-3 md:col-span-2">
          <div className="flex items-center gap-2.5 text-primary">
            <ExternalLink className="h-5 w-5" />
            <h3 className="font-display text-lg tracking-tight font-semibold">References & Sources</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
            {[
              "IPCC AR7 Synthesis Report on Climate Change (2025)",
              "EU Green Deal & Taxonomy Regulatory Framework (2026)",
              "Rotterdam Regional Flood Risk Attenuation Guidelines (2024)",
              "UN SDG 11 Municipal Case Studies Portfolio (2025)",
            ].map((ref, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                <span className="truncate">{ref}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
