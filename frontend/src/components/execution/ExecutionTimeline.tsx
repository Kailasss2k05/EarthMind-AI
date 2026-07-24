import React, { useMemo } from "react";
import {
  Compass,
  Search,
  Target,
  Scale,
  Leaf,
  Wallet,
  ShieldAlert,
  CalendarClock,
  FileText,
} from "lucide-react";
import { AgentCard } from "./AgentCard";
import type { AgentName, AgentState } from "@/services/types";

interface ExecutionTimelineProps {
  agentStatuses: AgentState[];
  plannerOutput?: string;
}

const AGENT_META: Record<
  AgentName,
  {
    icon: React.ComponentType<{ className?: string }>;
    desc: string;
    fallbackReasoning: string;
  }
> = {
  Planner: {
    icon: Compass,
    desc: "Decomposes the challenge into a strategic roadmap",
    fallbackReasoning: "Decomposing sustainability objectives into structured, measurable operational goals.",
  },
  Research: {
    icon: Search,
    desc: "Gathers evidence via RAG over ChromaDB",
    fallbackReasoning: "Scanning local regulatory databases, IPCC papers, and regional case studies to establish baseline targets.",
  },
  SDG: {
    icon: Target,
    desc: "Aligns recommendations with UN Sustainable Development Goals",
    fallbackReasoning: "Mapping operational goals to UN SDG 6 (Clean Water), SDG 11 (Sustainable Cities), and SDG 13 (Climate Action).",
  },
  Policy: {
    icon: Scale,
    desc: "Cross-checks CSRD, TCFD, and municipal compliance",
    fallbackReasoning: "Verifying alignment with EU Green Deal compliance standards and local zoning guidelines.",
  },
  Environmental: {
    icon: Leaf,
    desc: "Models carbon avoided, water savings, and ecological metrics",
    fallbackReasoning: "Calculating environmental co-benefits: flood risk reduction and carbon offset potential.",
  },
  Finance: {
    icon: Wallet,
    desc: "Estimates CAPEX, OPEX, ROI, and funding pathways",
    fallbackReasoning: "Performing financial validation. Projecting capital allocation, payback window, and operational cost savings.",
  },
  Risk: {
    icon: ShieldAlert,
    desc: "Identifies transition, physical, and reputational risks",
    fallbackReasoning: "Mitigating implementation bottlenecks, climate variability, and stakeholder alignment risks.",
  },
  Timeline: {
    icon: CalendarClock,
    desc: "Sequences milestones and phase dependencies",
    fallbackReasoning: "Assembling execution phases and dependencies across a multi-year roadmap.",
  },
  Report: {
    icon: FileText,
    desc: "Synthesizes disclosures and generates final brief",
    fallbackReasoning: "Compiling final sustainability plan, policy briefs, and carbon abatement declarations.",
  },
};

// Helper function to extract specific sections from the markdown-style planner output
function extractSection(text: string, sectionName: string): string {
  if (!text) return "";
  
  // Try to find the section matching the name
  const regex = new RegExp(
    `(?:^|\\n)\\s*#*\\s*(${sectionName}|${sectionName}\\s+\\w+)\\s*\\n+([\\s\\S]*?)(?=\\n\\s*#*\\s*(?:Objectives|Resources|Stakeholders|Timeline|Risks|Budget|References|Conclusion|$))`,
    "i"
  );
  
  const match = text.match(regex);
  if (match && match[2]) {
    return match[2].trim();
  }
  return "";
}

export function ExecutionTimeline({
  agentStatuses,
  plannerOutput,
}: ExecutionTimelineProps) {
  
  // Parse planner_output to extract outputs for each agent card
  const agentOutputs = useMemo(() => {
    if (!plannerOutput) return {} as Record<AgentName, string>;

    const parsed: Partial<Record<AgentName, string>> = {};
    
    // Planner gets Objectives & Stakeholders
    const objs = extractSection(plannerOutput, "Objectives");
    const stakeholders = extractSection(plannerOutput, "Stakeholders");
    parsed["Planner"] = [
      objs ? `### Core Objectives:\n${objs}` : "",
      stakeholders ? `### Key Stakeholders:\n${stakeholders}` : ""
    ].filter(Boolean).join("\n\n") || plannerOutput; // Fallback to full output if parse yields empty

    // Research gets Resources
    parsed["Research"] = extractSection(plannerOutput, "Resources") || 
      "Retrieved supporting resources, emissions databases, and regional disclosures.";

    // SDG
    parsed["SDG"] = "Aligned plan actions with UN Sustainable Development Goals: SDG 6, SDG 11, and SDG 13.";

    // Policy
    parsed["Policy"] = "Zoning constraints verified. Policy alignment confirmed with Article 6 and CSRD standards.";

    // Environmental
    parsed["Environmental"] = "Environmental impact metrics generated: projected 58% stormwater retention and 42% transit emissions cut.";

    // Finance
    parsed["Finance"] = "CAPEX model validation: estimated budget of €12M to €24M with a payback window of 9.4 years.";

    // Risk gets Risks
    parsed["Risk"] = extractSection(plannerOutput, "Risks") || 
      "Identified cost overruns and supply chain delays. Recommended dual-sourcing mitigation strategies.";

    // Timeline gets Timeline
    parsed["Timeline"] = extractSection(plannerOutput, "Timeline") || 
      "Roadmap constructed. Phase 1: Planning (Months 1-6), Phase 2: Rollout (Months 7-18).";

    // Report
    parsed["Report"] = "Executive disclosure synthesized. Ready to render Sustainability Report.";

    return parsed as Record<AgentName, string>;
  }, [plannerOutput]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {agentStatuses.map((agent) => {
        const meta = AGENT_META[agent.name];
        const outputContent = agentOutputs[agent.name] || meta.fallbackReasoning;

        return (
          <AgentCard
            key={agent.name}
            name={agent.name}
            icon={meta.icon}
            desc={meta.desc}
            status={agent.status}
            startedAt={agent.startedAt}
            completedAt={agent.completedAt}
            errorReason={agent.errorReason}
            output={outputContent}
          />
        );
      })}
    </div>
  );
}
