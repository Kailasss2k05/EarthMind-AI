/**
 * src/pdf/components/SDGSection.tsx
 */

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { PageWrapper } from "./PageWrapper";
import { S, BRAND } from "../styles";
import type { ReportData } from "../types";
import { SDG_PALETTE } from "../types";

interface Props {
  data: Pick<ReportData, "reportId" | "generatedDate" | "generatedTime" | "featuredSdgs">;
}

export function SDGSection({ data }: Props) {
  return (
    <PageWrapper
      sectionTitle="SDG Alignment"
      reportId={data.reportId}
      generatedDate={data.generatedDate}
      generatedTime={data.generatedTime}
    >
      <View style={S.sectionHeader}>
        <View style={S.sectionHeaderDot} />
        <Text style={S.h2}>UN SDG Alignment</Text>
      </View>

      <Text style={{ ...S.body, marginBottom: 12 }}>
        Advances measurable urban resilience contributions aligned with the 2030
        Agenda for Sustainable Development:
      </Text>

      {data.featuredSdgs.map((code) => {
        const sdg = SDG_PALETTE[code];
        if (!sdg) return null;
        return (
          <View
            key={code}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              marginBottom: 8,
              borderRadius: 6,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: sdg.color + "40",
              backgroundColor: sdg.color + "10",
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: sdg.color,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Helvetica-Bold",
                  color: BRAND.white,
                }}
              >
                {code}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: "Helvetica-Bold",
                  color: sdg.color,
                }}
              >
                SDG {code}
              </Text>
              <Text style={{ fontSize: 8, color: BRAND.navyLight }}>
                {sdg.title}
              </Text>
            </View>
          </View>
        );
      })}
    </PageWrapper>
  );
}
