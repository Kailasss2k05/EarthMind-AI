/**
 * src/pdf/components/FinancialSection.tsx
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
    | "financialRows"
    | "financialKpis"
  >;
}

export function FinancialSection({ data }: Props) {
  return (
    <PageWrapper
      sectionTitle="Financial Analysis"
      reportId={data.reportId}
      generatedDate={data.generatedDate}
      generatedTime={data.generatedTime}
    >
      <View style={S.sectionHeader}>
        <View style={S.sectionHeaderDot} />
        <Text style={S.h2}>Financial Analysis</Text>
      </View>
      <Text style={{ ...S.bodySmall, marginBottom: 12 }}>
        Budget allocation · Total CAPEX €24 M
      </Text>

      {/* ── KPI pills ── */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        {data.financialKpis.map((kpi) => (
          <View
            key={kpi.label}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: BRAND.borderLight,
              borderStyle: "solid",
              borderRadius: 6,
              padding: 10,
              alignItems: "center",
            }}
          >
            <Text style={S.label}>{kpi.label}</Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Helvetica-Bold",
                color: BRAND.purple,
                marginTop: 2,
              }}
            >
              {kpi.value}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Budget bars ── */}
      <View
        style={{
          backgroundColor: BRAND.white,
          borderRadius: 8,
          padding: 14,
          borderWidth: 1,
          borderColor: BRAND.borderLight,
          borderStyle: "solid",
        }}
      >
        <Text
          style={{
            ...S.label,
            marginBottom: 10,
            color: BRAND.navy,
            fontFamily: "Helvetica-Bold",
          }}
        >
          Budget Allocation Breakdown
        </Text>
        {data.financialRows.map((row) => (
          <View key={row.label} style={{ marginBottom: 10 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 3,
              }}
            >
              <Text style={{ fontSize: 8, color: BRAND.navyLight }}>
                {row.label}
              </Text>
              <Text
                style={{
                  fontSize: 8,
                  fontFamily: "Helvetica-Bold",
                  color: BRAND.navy,
                }}
              >
                {row.value}%
              </Text>
            </View>
            <View style={S.progressTrack}>
              <View
                style={{
                  ...S.progressFill,
                  width: `${row.value}%`,
                  backgroundColor: row.color,
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </PageWrapper>
  );
}
