/**
 * src/pdf/components/ReferencesSection.tsx
 */

import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { PageWrapper } from "./PageWrapper";
import { S, BRAND } from "../styles";
import type { ReportData } from "../types";

interface Props {
  data: Pick<ReportData, "reportId" | "generatedDate" | "generatedTime" | "references">;
}

export function ReferencesSection({ data }: Props) {
  return (
    <PageWrapper
      sectionTitle="References & Sources"
      reportId={data.reportId}
      generatedDate={data.generatedDate}
      generatedTime={data.generatedTime}
    >
      <View style={S.sectionHeader}>
        <View style={S.sectionHeaderDot} />
        <Text style={S.h2}>References &amp; Sources</Text>
      </View>
      <Text style={{ ...S.bodySmall, marginBottom: 12 }}>
        Evidence base for this report
      </Text>

      {data.references.map((ref, idx) => (
        <View key={idx} style={{ ...S.card, marginBottom: 10 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <View
              style={{
                backgroundColor: BRAND.purple + "10",
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderWidth: 1,
                borderColor: BRAND.purple + "20",
                borderStyle: "solid",
              }}
            >
              <Text
                style={{
                  fontSize: 6,
                  fontFamily: "Helvetica-Bold",
                  color: BRAND.purple,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {ref.type}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#f1f5f9",
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 7,
                  fontFamily: "Helvetica-Bold",
                  color: BRAND.navyLight,
                }}
              >
                {ref.year}
              </Text>
            </View>
          </View>

          <Text
            style={{
              fontSize: 9,
              fontFamily: "Helvetica-Bold",
              color: BRAND.navy,
              marginBottom: 3,
            }}
          >
            {ref.title}
          </Text>
          <Text style={S.bodySmall}>{ref.publisher}</Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
              paddingTop: 6,
              borderTopWidth: 1,
              borderTopColor: BRAND.borderLight,
              borderStyle: "solid",
            }}
          >
            <Text style={{ fontSize: 7, color: BRAND.muted }}>
              Retrieved by:{" "}
              <Text style={{ fontFamily: "Helvetica-Bold", color: BRAND.purple }}>
                {ref.retrievedBy}
              </Text>
            </Text>
            {ref.url && (
              <Link
                src={ref.url}
                style={{
                  fontSize: 7,
                  color: BRAND.purple,
                  textDecoration: "underline",
                }}
              >
                View Source →
              </Link>
            )}
          </View>
        </View>
      ))}
    </PageWrapper>
  );
}
