/**
 * src/pdf/components/TableOfContents.tsx
 */

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { PageWrapper } from "./PageWrapper";
import { S, BRAND } from "../styles";
import type { ReportData } from "../types";

const TOC_ENTRIES = [
  { num: "01", title: "Executive Summary",      page: 3 },
  { num: "02", title: "SDG Alignment",          page: 4 },
  { num: "03", title: "Policy Recommendations", page: 4 },
  { num: "04", title: "Environmental Impact",   page: 5 },
  { num: "05", title: "Financial Analysis",     page: 5 },
  { num: "06", title: "Risk Assessment",        page: 6 },
  { num: "07", title: "Implementation Roadmap", page: 7 },
  { num: "08", title: "References & Sources",   page: 7 },
  { num: "09", title: "AI Execution Summary",   page: 8 },
] as const;

interface Props {
  data: Pick<ReportData, "reportId" | "generatedDate" | "generatedTime">;
}

export function TableOfContents({ data }: Props) {
  return (
    <PageWrapper
      sectionTitle="Table of Contents"
      reportId={data.reportId}
      generatedDate={data.generatedDate}
      generatedTime={data.generatedTime}
    >
      {/* ── Heading ── */}
      <View style={{ marginBottom: 24 }}>
        <Text style={S.h2}>Table of Contents</Text>
        <Text style={S.bodySmall}>EarthMind AI Sustainability Action Report</Text>
      </View>

      {/* ── Entries ── */}
      <View
        style={{
          backgroundColor: "#fafafa",
          borderRadius: 8,
          borderWidth: 1,
          borderColor: BRAND.borderLight,
          borderStyle: "solid",
          overflow: "hidden",
        }}
      >
        {TOC_ENTRIES.map((entry, idx) => (
          <View
            key={entry.num}
            style={[
              S.tocRow,
              {
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: idx % 2 === 0 ? BRAND.white : "#fafafa",
              },
            ]}
          >
            <Text style={S.tocNum}>{entry.num}.</Text>
            <Text style={S.tocTitle}>{entry.title}</Text>
            <Text style={S.tocPage}>Page {entry.page}</Text>
          </View>
        ))}
      </View>

      {/* ── Footer note ── */}
      <Text
        style={{
          marginTop: 20,
          fontSize: 7,
          color: BRAND.muted,
          textAlign: "center",
        }}
      >
        This report was generated automatically by the EarthMind AI Multi-Agent
        Sustainability Intelligence Platform using Ollama and LangGraph.
      </Text>
    </PageWrapper>
  );
}
