/**
 * src/pdf/components/TimelineSection.tsx
 */

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { PageWrapper } from "./PageWrapper";
import { S, BRAND } from "../styles";
import type { ReportData } from "../types";

interface Props {
  data: Pick<ReportData, "reportId" | "generatedDate" | "generatedTime" | "timelinePhases">;
}

export function TimelineSection({ data }: Props) {
  return (
    <PageWrapper
      sectionTitle="Implementation Roadmap"
      reportId={data.reportId}
      generatedDate={data.generatedDate}
      generatedTime={data.generatedTime}
    >
      <View style={S.sectionHeader}>
        <View style={S.sectionHeaderDot} />
        <Text style={S.h2}>Implementation Roadmap</Text>
      </View>
      <Text style={{ ...S.bodySmall, marginBottom: 16 }}>
        Phased deployment schedule
      </Text>

      {data.timelinePhases.map((phase, idx) => {
        const isLast = idx === data.timelinePhases.length - 1;
        return (
          <View
            key={phase.phase}
            style={{
              flexDirection: "row",
              marginBottom: isLast ? 0 : 12,
            }}
          >
            {/* Timeline spine + dot */}
            <View style={{ width: 28, alignItems: "center" }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: isLast ? BRAND.purple : BRAND.white,
                  borderWidth: 2,
                  borderColor: BRAND.purple,
                  borderStyle: "solid",
                  zIndex: 1,
                }}
              />
              {!isLast && (
                <View
                  style={{
                    width: 2,
                    flex: 1,
                    backgroundColor: BRAND.borderLight,
                    marginTop: 2,
                  }}
                />
              )}
            </View>

            {/* Phase content */}
            <View
              style={{
                flex: 1,
                marginLeft: 8,
                backgroundColor: BRAND.white,
                borderRadius: 6,
                padding: 12,
                borderWidth: 1,
                borderColor: BRAND.borderLight,
                borderStyle: "solid",
                marginBottom: 4,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 8,
                    fontFamily: "Helvetica-Bold",
                    color: BRAND.purple,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {phase.phase}
                </Text>
                {phase.period && (
                  <Text style={{ fontSize: 7, color: BRAND.muted }}>
                    {phase.period}
                  </Text>
                )}
              </View>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Helvetica-Bold",
                  color: BRAND.navy,
                }}
              >
                {phase.title}
              </Text>
            </View>
          </View>
        );
      })}
    </PageWrapper>
  );
}
