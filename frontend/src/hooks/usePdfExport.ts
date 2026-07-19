import { useCallback, useRef } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import React from "react";
import { ReportDocument } from "@/pdf/ReportDocument";
import type { ReportData } from "@/pdf/types";
import type { DocumentProps } from "@react-pdf/renderer";

export function usePdfExport(reportId: string, data: ReportData) {
  const generatingRef = useRef(false);

  const generate = useCallback(async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;

    const toastId = toast.loading("Generating PDF…", {
      description: "Building report pages…",
    });

    try {
      // @react-pdf/renderer renders entirely in a Web Worker — no DOM capture,
      // no canvas, no oklch parsing. Pure programmatic PDF generation.
      const element = React.createElement(
        ReportDocument,
        { data },
      ) as unknown as React.ReactElement<DocumentProps>;
      const blob = await pdf(element).toBlob();

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `EarthMind_Report_${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Small delay before revoking so the download has time to start
      setTimeout(() => URL.revokeObjectURL(url), 5_000);

      toast.success("PDF Downloaded!", {
        id: toastId,
        description: `EarthMind_Report_${reportId}.pdf`,
      });
    } catch (err) {
      console.error("[usePdfExport]", err);
      toast.error("PDF generation failed", {
        id: toastId,
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      generatingRef.current = false;
    }
  }, [reportId, data]);

  return { generate };
}

