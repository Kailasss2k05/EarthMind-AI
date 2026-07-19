/**
 * src/pdf/components/RiskSection.tsx
 */

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { PageWrapper } from "./PageWrapper";
import { S, BRAND } from "../styles";
import type { ReportData } from "../types";

const RISK_COLORS: Record<string, { color: string; bg: string }> = {
  low:      { color: "#22c55e", bg: "rgba(34,197,94,0.10)" },
  medium:   { color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
  high:     { color: "#f97316", bg: "rgba(249,115,22,0.10)" },
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.10)" },
};

interface Props {
  data: Pick<ReportData, "reportId" | "generatedDate" | "generatedTime" | "risks">;
}

export function RiskSection({ data }: Props) {
  return (
    <PageWrapper
      sectionTitle="Risk Assessment"
      reportId={data.reportId}
      generatedDate={data.generatedDate}
      generatedTime={data.generatedTime}
    >
      <View style={S.sectionHeader}>
        <View style={S.sectionHeaderDot} />
        <Text style={S.h2}>Risk Assessment</Text>
      </View>
      <Text style={{ ...S.bodySmall, marginBottom: 12 }}>
        Implementation &amp; climate risk register
      </Text>

      {/* Table header */}
      <View
        style={{
          borderRadius: 8,
          borderWidth: 1,
          borderColor: BRAND.borderLight,
          borderStyle: "solid",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            ...S.tableHeader,
            backgroundColor: BRAND.navy,
          }}
        >
          <Text style={{ ...S.tableHeaderCell, color: BRAND.mutedLight, flex: 2 }}>
            Risk Factor
          </Text>
          <Text style={{ ...S.tableHeaderCell, color: BRAND.mutedLight, width: 70 }}>
            Likelihood
          </Text>
          <Text style={{ ...S.tableHeaderCell, color: BRAND.mutedLight, flex: 3 }}>
            Mitigation Strategy
          </Text>
        </View>

        {data.risks.map((risk, idx) => {
          const levelKey = risk.likelihood.toLowerCase();
          const badge = RISK_COLORS[levelKey] ?? RISK_COLORS.medium;
          return (
            <View
              key={idx}
              style={idx % 2 === 0 ? S.tableRow : S.tableRowAlt}
            >
              <Text style={{ ...S.tableCellBold, flex: 2 }}>{risk.factor}</Text>
              <View style={{ width: 70, justifyContent: "center" }}>
                <View
                  style={{
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 10,
                    backgroundColor: badge.bg,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 7,
                      fontFamily: "Helvetica-Bold",
                      color: badge.color,
                    }}
                  >
                    {risk.likelihood}
                  </Text>
                </View>
              </View>
              <Text style={{ ...S.tableCell, flex: 3 }}>{risk.mitigation}</Text>
            </View>
          );
        })}
      </View>
    </PageWrapper>
  );
}
