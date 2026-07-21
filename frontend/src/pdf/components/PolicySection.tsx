/**
 * src/pdf/components/PolicySection.tsx
 */

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { PageWrapper } from "./PageWrapper";
import { S, BRAND } from "../styles";
import type { ReportData } from "../types";

interface Props {
  data: Pick<ReportData, "reportId" | "generatedDate" | "generatedTime" | "policies">;
}

export function PolicySection({ data }: Props) {
  return (
    <PageWrapper
      sectionTitle="Policy Recommendations"
      reportId={data.reportId}
      generatedDate={data.generatedDate}
      generatedTime={data.generatedTime}
    >
      <View style={S.sectionHeader}>
        <View style={S.sectionHeaderDot} />
        <Text style={S.h2}>Policy Recommendations</Text>
      </View>
      <Text style={{ ...S.bodySmall, marginBottom: 12 }}>
        Regulatory & governance actions
      </Text>

      {data.policies.map((p, idx) => (
        <View
          key={idx}
          style={{
            ...S.card,
            flexDirection: "row",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Helvetica-Bold",
              color: BRAND.purple + "60",
              width: 28,
              lineHeight: 1,
            }}
          >
            {String(idx + 1).padStart(2, "0")}
          </Text>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Helvetica-Bold",
                color: BRAND.navy,
                marginBottom: 4,
              }}
            >
              {p.title}
            </Text>
            <Text style={S.body}>{p.description}</Text>
          </View>
        </View>
      ))}
    </PageWrapper>
  );
}
