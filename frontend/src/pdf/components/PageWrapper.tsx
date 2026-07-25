/**
 * src/pdf/components/PageWrapper.tsx
 *
 * Wraps content pages with a consistent header bar and footer.
 * The footer uses react-pdf's render prop pattern to access page/total numbers.
 */

import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { S, BRAND, PAGE } from "../styles";

interface PageWrapperProps {
  children: React.ReactNode;
  /** Section title shown in the top-right header */
  sectionTitle?: string;
  reportId: string;
  generatedDate: string;
  generatedTime: string;
}

export function PageWrapper({
  children,
  sectionTitle,
  reportId,
  generatedDate,
  generatedTime,
}: PageWrapperProps) {
  return (
    <Page size="A4" style={S.page}>
      {/* ── Top header bar ── */}
      <View
        fixed
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: BRAND.borderLight,
          borderStyle: "solid",
        }}
      >
        <Text
          style={{
            fontSize: 8,
            fontFamily: "Helvetica-Bold",
            color: BRAND.purple,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          EarthMind AI
        </Text>
        {sectionTitle && (
          <Text style={{ fontSize: 8, color: BRAND.muted }}>
            {sectionTitle}
          </Text>
        )}
        <Text style={{ fontSize: 8, color: BRAND.muted }}>{reportId}</Text>
      </View>

      {/* ── Page content ── */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* ── Footer ── */}
      <View
        fixed
        style={{
          position: "absolute",
          bottom: 20,
          left: PAGE.marginLeft,
          right: PAGE.marginRight,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopWidth: 1,
          borderTopColor: BRAND.borderLight,
          borderStyle: "solid",
          paddingTop: 6,
        }}
      >
        <View>
          <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: BRAND.navyLight }}>
            EarthMind AI
          </Text>
          <Text style={{ fontSize: 6, color: BRAND.muted }}>
            Multi-Agent Sustainability Intelligence Platform
          </Text>
          <Text style={{ fontSize: 6, color: BRAND.muted }}>
            Generated using Ollama + LangGraph
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{ fontSize: 7, color: BRAND.muted }}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
          <Text style={{ fontSize: 6, color: BRAND.muted }}>
            {generatedDate} · {generatedTime}
          </Text>
          <Text
            style={{
              fontSize: 6,
              color: BRAND.purple,
              fontFamily: "Helvetica-Bold",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            CSRD · ESRS · SDG Aligned
          </Text>
        </View>
      </View>
    </Page>
  );
}
