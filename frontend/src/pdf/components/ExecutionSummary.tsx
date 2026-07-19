/**
 * src/pdf/components/ExecutionSummary.tsx
 */

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { PageWrapper } from "./PageWrapper";
import { S, BRAND } from "../styles";
import type { ReportData } from "../types";

interface Props {
  data: Pick<
    ReportData,
    | "reportId"
    | "generatedDate"
    | "generatedTime"
    | "agentLogRows"
    | "techInfo"
    | "executionDuration"
  >;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "#22c55e",
  running:   "#f59e0b",
  failed:    "#ef4444",
  queued:    "#94a3b8",
};

export function ExecutionSummary({ data }: Props) {
  return (
    <PageWrapper
      sectionTitle="AI Execution Summary"
      reportId={data.reportId}
      generatedDate={data.generatedDate}
      generatedTime={data.generatedTime}
    >
      <View style={S.sectionHeader}>
        <View style={S.sectionHeaderDot} />
        <Text style={S.h2}>AI Execution Summary</Text>
      </View>
      <Text style={{ ...S.bodySmall, marginBottom: 12 }}>
        System audit log &amp; multi-agent runtime analytics
      </Text>

      {/* ── System stats ── */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Total Agents",       value: String(data.techInfo.agents) },
          { label: "Execution Time",     value: data.techInfo.executionTime },
          { label: "Knowledge Sources",  value: data.techInfo.knowledgeSources },
          { label: "Standard",           value: "CSRD · ESRS · SDG" },
        ].map((stat) => (
          <View
            key={stat.label}
            style={{
              flex: 1,
              backgroundColor: BRAND.navy,
              borderRadius: 6,
              padding: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 7, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              {stat.label}
            </Text>
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: BRAND.white }}>
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Agent execution log table ── */}
      <View
        style={{
          borderRadius: 8,
          borderWidth: 1,
          borderColor: BRAND.borderLight,
          borderStyle: "solid",
          overflow: "hidden",
        }}
      >
        <View style={{ ...S.tableHeader, backgroundColor: BRAND.navy }}>
          <Text style={{ ...S.tableHeaderCell, color: BRAND.mutedLight, width: 24 }}>#</Text>
          <Text style={{ ...S.tableHeaderCell, color: BRAND.mutedLight, flex: 2 }}>Agent</Text>
          <Text style={{ ...S.tableHeaderCell, color: BRAND.mutedLight, flex: 2 }}>Status</Text>
          <Text style={{ ...S.tableHeaderCell, color: BRAND.mutedLight, flex: 2 }}>Duration</Text>
          <Text style={{ ...S.tableHeaderCell, color: BRAND.mutedLight, width: 40 }}>Order</Text>
        </View>

        {data.agentLogRows.map((row, idx) => {
          const statusKey = row.status.toLowerCase();
          const statusColor = STATUS_COLORS[statusKey] ?? STATUS_COLORS.queued;
          return (
            <View key={row.name} style={idx % 2 === 0 ? S.tableRow : S.tableRowAlt}>
              <Text style={{ ...S.tableCell, width: 24, color: BRAND.muted }}>
                {String(idx + 1).padStart(2, "0")}
              </Text>
              <Text style={{ ...S.tableCellBold, flex: 2 }}>{row.name}</Text>
              <View style={{ flex: 2, justifyContent: "center" }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: statusColor,
                    }}
                  />
                  <Text style={{ fontSize: 8, color: statusColor, fontFamily: "Helvetica-Bold" }}>
                    {row.status}
                  </Text>
                </View>
              </View>
              <Text style={{ ...S.tableCell, flex: 2, color: BRAND.navyLight }}>
                {row.duration}
              </Text>
              <Text style={{ ...S.tableCell, width: 40, color: BRAND.muted }}>
                {String(row.order)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* ── Platform info ── */}
      <View style={{ ...S.card, marginTop: 14, backgroundColor: "#f8fafc" }}>
        <Text style={{ ...S.label, marginBottom: 8 }}>Platform Details</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          {[
            { label: "LLM Platform",       value: data.techInfo.llm },
            { label: "Orchestration",      value: data.techInfo.platform },
            { label: "Knowledge Base",     value: data.techInfo.kb },
            { label: "Compliance",         value: data.techInfo.standard },
          ].map((item) => (
            <View key={item.label} style={{ minWidth: 110 }}>
              <Text style={S.bodySmall}>{item.label}</Text>
              <Text
                style={{
                  fontSize: 8,
                  fontFamily: "Helvetica-Bold",
                  color: BRAND.navy,
                  marginTop: 2,
                }}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </PageWrapper>
  );
}
