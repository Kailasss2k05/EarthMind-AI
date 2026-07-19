/**
 * src/pdf/styles.ts
 *
 * All @react-pdf/renderer StyleSheet definitions for the EarthMind AI report.
 * Only hex / rgb colors — no oklch, no CSS variables.
 */

import { StyleSheet, Font } from "@react-pdf/renderer";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
export const BRAND = {
  purple:      "#7c3aed",
  purpleLight: "#a78bfa",
  purpleDark:  "#4c1d95",
  navy:        "#0f172a",
  navyMid:     "#1e293b",
  navyLight:   "#334155",
  white:       "#ffffff",
  offWhite:    "#f8fafc",
  muted:       "#94a3b8",
  mutedLight:  "#cbd5e1",
  border:      "#334155",
  borderLight: "#e2e8f0",
  green:       "#22c55e",
  amber:       "#f59e0b",
  orange:      "#f97316",
  red:         "#ef4444",
  blue:        "#26BDE2",
  teal:        "#56C02B",
} as const;

// ─── Page dimensions (A4) ─────────────────────────────────────────────────────
export const PAGE = {
  width:        595.28,
  height:       841.89,
  marginLeft:   40,
  marginRight:  40,
  marginTop:    50,
  marginBottom: 60,
} as const;

// ─── Shared stylesheet ────────────────────────────────────────────────────────
export const S = StyleSheet.create({
  // ── Page ──
  page: {
    fontFamily: "Helvetica",
    backgroundColor: BRAND.white,
    paddingLeft:   PAGE.marginLeft,
    paddingRight:  PAGE.marginRight,
    paddingTop:    PAGE.marginTop,
    paddingBottom: PAGE.marginBottom,
    fontSize: 10,
    color: BRAND.navy,
  },

  // ── Cover page (dark background) ──
  coverPage: {
    fontFamily: "Helvetica",
    backgroundColor: BRAND.navy,
    paddingLeft:   PAGE.marginLeft,
    paddingRight:  PAGE.marginRight,
    paddingTop:    80,
    paddingBottom: 60,
    fontSize: 10,
    color: BRAND.white,
  },

  // ── Section headings ──
  h1: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: BRAND.white,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: BRAND.navy,
    marginBottom: 4,
  },
  h2White: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: BRAND.white,
    marginBottom: 4,
  },
  h3: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: BRAND.navy,
    marginBottom: 3,
  },
  h3Purple: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: BRAND.purple,
    marginBottom: 3,
  },

  // ── Body text ──
  body: {
    fontSize: 9,
    color: BRAND.navyLight,
    lineHeight: 1.5,
  },
  bodySmall: {
    fontSize: 8,
    color: BRAND.muted,
    lineHeight: 1.4,
  },
  bodyWhite: {
    fontSize: 9,
    color: BRAND.white,
    lineHeight: 1.5,
  },
  label: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: BRAND.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  labelLight: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: BRAND.mutedLight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // ── Layout ──
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  col2: {
    flexDirection: "row",
    gap: 12,
  },
  flex1: {
    flex: 1,
  },

  // ── Section wrapper ──
  section: {
    marginBottom: 20,
  },
  sectionInner: {
    backgroundColor: BRAND.offWhite,
    borderRadius: 8,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BRAND.borderLight,
    borderStyle: "solid",
  },

  // ── Cards ──
  card: {
    backgroundColor: BRAND.white,
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: BRAND.borderLight,
    borderStyle: "solid",
    marginBottom: 8,
  },
  cardGrid2: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  cardHalf: {
    flex: 1,
    backgroundColor: BRAND.white,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: BRAND.borderLight,
    borderStyle: "solid",
  },

  // ── Metric / KPI cards ──
  metricCard: {
    flex: 1,
    backgroundColor: BRAND.white,
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: BRAND.borderLight,
    borderStyle: "solid",
    alignItems: "center",
  },
  metricValue: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: BRAND.purple,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 7,
    color: BRAND.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    textAlign: "center",
  },
  metricDesc: {
    fontSize: 7,
    color: BRAND.mutedLight,
    textAlign: "center",
    marginTop: 2,
  },

  // ── Section header row ──
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.borderLight,
    borderStyle: "solid",
    paddingBottom: 8,
  },
  sectionHeaderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND.purple,
  },

  // ── Progress bars ──
  progressTrack: {
    height: 6,
    backgroundColor: BRAND.borderLight,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 3,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },

  // ── Risk badge ──
  badge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },

  // ── Table ──
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND.offWhite,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.borderLight,
    borderStyle: "solid",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.borderLight,
    borderStyle: "solid",
    alignItems: "center",
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.borderLight,
    borderStyle: "solid",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  tableCell: {
    fontSize: 8,
    color: BRAND.navyLight,
  },
  tableCellBold: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: BRAND.navy,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: BRAND.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── TOC ──
  tocRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    borderStyle: "solid",
  },
  tocNum: {
    fontSize: 9,
    color: BRAND.purple,
    fontFamily: "Helvetica-Bold",
    width: 24,
  },
  tocTitle: {
    flex: 1,
    fontSize: 9,
    color: BRAND.navy,
  },
  tocPage: {
    fontSize: 9,
    color: BRAND.muted,
    fontFamily: "Helvetica-Bold",
  },

  // ── Footer ──
  footer: {
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
  },
  footerText: {
    fontSize: 7,
    color: BRAND.muted,
  },
  footerBold: {
    fontSize: 7,
    color: BRAND.navyLight,
    fontFamily: "Helvetica-Bold",
  },

  // ── Cover-specific ──
  coverBadge: {
    backgroundColor: "rgba(124,58,237,0.25)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  coverBadgeText: {
    fontSize: 8,
    color: BRAND.purpleLight,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  coverDivider: {
    height: 2,
    backgroundColor: BRAND.purple,
    marginVertical: 20,
    width: 48,
  },
  coverMetaGrid: {
    flexDirection: "row",
    gap: 0,
    marginTop: 40,
    flexWrap: "wrap",
  },
  coverMetaCell: {
    width: "50%",
    paddingVertical: 10,
    paddingRight: 16,
  },
  coverMetaLabel: {
    fontSize: 7,
    color: "#64748b",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  coverMetaValue: {
    fontSize: 10,
    color: BRAND.white,
    fontFamily: "Helvetica-Bold",
  },
  coverTagline: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 6,
    letterSpacing: 0.3,
  },
});
