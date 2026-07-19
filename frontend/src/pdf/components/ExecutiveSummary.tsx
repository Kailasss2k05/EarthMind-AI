/**
 * src/pdf/components/ExecutiveSummary.tsx
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
    | "queryText"
    | "objectives"
    | "stakeholders"
    | "keyOutcomes"
  >;
}

export function ExecutiveSummary({ data }: Props) {
  return (
    <PageWrapper
      sectionTitle="Executive Summary"
      reportId={data.reportId}
      generatedDate={data.generatedDate}
      generatedTime={data.generatedTime}
    >
      {/* ── Section heading ── */}
      <View style={S.sectionHeader}>
        <View style={S.sectionHeaderDot} />
        <Text style={S.h2}>Executive Summary</Text>
      </View>

      {/* ── Introduction paragraph ── */}
      <View style={S.sectionInner}>
        <Text style={S.bodySmall}>Multi-agent optimization synthesis</Text>
        <Text style={{ ...S.body, marginTop: 6 }}>
          This report outlines strategic pathways to address the sustainability
          brief:{" "}
          <Text style={{ fontFamily: "Helvetica-Bold", color: BRAND.navy }}>
            "{data.queryText}"
          </Text>
          . Through dynamic RAG over regional regulations and policy frameworks,
          our nine-agent collective identified high-impact co-benefits aligning
          water conservation, public space revitalisation, and emissions
          abatement — collectively delivering a CSRD-compliant action plan
          targeting ESRS E1 and SDG 11, 13 alignment by 2027.
        </Text>
      </View>

      {/* ── Key Outcomes ── */}
      <Text
        style={{
          fontSize: 8,
          fontFamily: "Helvetica-Bold",
          color: BRAND.purple,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 8,
        }}
      >
        Key Outcomes
      </Text>

      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {data.keyOutcomes.map((item) => (
          <View
            key={item.label}
            style={{
              flex: 1,
              minWidth: 100,
              backgroundColor: BRAND.white,
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: BRAND.borderLight,
              borderStyle: "solid",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 7,
                color: BRAND.purple,
                fontFamily: "Helvetica-Bold",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 4,
                textAlign: "center",
              }}
            >
              {item.label}
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Helvetica-Bold",
                color: BRAND.navy,
              }}
            >
              {item.value}
            </Text>
            <Text
              style={{
                fontSize: 7,
                color: BRAND.muted,
                textAlign: "center",
                marginTop: 3,
              }}
            >
              {item.desc}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Objectives ── */}
      <View style={{ ...S.card, marginTop: 12 }}>
        <Text style={S.h3Purple}>Objectives</Text>
        <Text style={S.body}>{data.objectives}</Text>
      </View>

      {/* ── Stakeholders ── */}
      <View style={S.card}>
        <Text style={S.h3Purple}>Key Stakeholders</Text>
        <Text style={S.body}>{data.stakeholders}</Text>
      </View>
    </PageWrapper>
  );
}
