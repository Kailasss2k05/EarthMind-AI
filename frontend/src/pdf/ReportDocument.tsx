/**
 * src/pdf/ReportDocument.tsx
 *
 * Root @react-pdf/renderer Document.
 * Accepts a single `ReportData` prop and assembles all pages.
 *
 * Usage (download):
 *   const blob = await pdf(<ReportDocument data={data} />).toBlob();
 *
 * Usage (inline link):
 *   <PDFDownloadLink document={<ReportDocument data={data} />} fileName="report.pdf">
 *     Download
 *   </PDFDownloadLink>
 */

import React from "react";
import { Document } from "@react-pdf/renderer";

import { CoverPage }           from "./components/CoverPage";
import { TableOfContents }     from "./components/TableOfContents";
import { ExecutiveSummary }    from "./components/ExecutiveSummary";
import { SDGSection }          from "./components/SDGSection";
import { PolicySection }       from "./components/PolicySection";
import { EnvironmentalSection } from "./components/EnvironmentalSection";
import { FinancialSection }    from "./components/FinancialSection";
import { RiskSection }         from "./components/RiskSection";
import { TimelineSection }     from "./components/TimelineSection";
import { ReferencesSection }   from "./components/ReferencesSection";
import { ExecutionSummary }    from "./components/ExecutionSummary";

import type { ReportData } from "./types";

interface Props {
  data: ReportData;
}

export function ReportDocument({ data }: Props) {
  return (
    <Document
      title={`EarthMind AI – ${data.queryText}`}
      author="EarthMind AI Multi-Agent Platform"
      subject="Sustainability Action Report"
      creator="EarthMind AI v1.8.4"
      producer="@react-pdf/renderer"
      keywords="sustainability, ESG, CSRD, ESRS, SDG, LangGraph, watsonx.ai"
    >
      <CoverPage data={data} />
      <TableOfContents data={data} />
      <ExecutiveSummary data={data} />
      <SDGSection data={data} />
      <PolicySection data={data} />
      <EnvironmentalSection data={data} />
      <FinancialSection data={data} />
      <RiskSection data={data} />
      <TimelineSection data={data} />
      <ReferencesSection data={data} />
      <ExecutionSummary data={data} />
    </Document>
  );
}
