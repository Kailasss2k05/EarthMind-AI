/**
 * src/pdf/components/EnvironmentalSection.tsx
 */

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { PageWrapper } from "./PageWrapper";
import { S, BRAND } from "../styles";
import type { ReportData } from "../types";

interface Props {
  data: Pick<ReportData, "reportId" | "generatedDate" | "generatedTime" | "envMetrics">;
}

export function EnvironmentalSection({ data }: Props) {
  return (
    <PageWrapper
      sectionTitle="Environmental Impact"
      reportId={data.reportId}
      generatedDate={data.generatedDate}
      generatedTime={data.generatedTime}
    >
      <View style={S.sectionHeader}>
        <View style={S.sectionHeaderDot} />
        <Text style={S.h2}>Environmental Impact</Text>
      </View>
      <Text style={{ ...S.bodySmall, marginBottom: 12 }}>
        Modelled co-benefits from deployment
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {data.envMetrics.map((metric) => (
          <View
            key={metric.label}
            style={{
              width: "47%",
              backgroundColor: BRAND.white,
              borderRadius: 8,
              padding: 14,
              borderWidth: 1,
              borderColor: BRAND.borderLight,
              borderStyle: "solid",
            }}
          >
            {/* Color dot indicator */}
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: metric.color,
                marginBottom: 8,
              }}
            />
            <Text
              style={{
                fontSize: 7,
                fontFamily: "Helvetica-Bold",
                color: BRAND.muted,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                marginBottom: 4,
              }}
            >
              {metric.label}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Helvetica-Bold",
                color: BRAND.navy,
              }}
            >
              {metric.value}
            </Text>
          </View>
        ))}
      </View>
    </PageWrapper>
  );
}
