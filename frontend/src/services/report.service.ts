import { get } from "./api";
import { ReportHistoryListResponse, ReportDetailResponse } from "./types";

export const reportService = {
  getReports: (skip = 0, limit = 100, query = "", sort = "desc") => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      sort,
    });
    if (query) params.append("query", query);
    return get<ReportHistoryListResponse>(`/reports?${params.toString()}`);
  },

  getReportById: (reportId: string) =>
    get<ReportDetailResponse>(`/reports/${encodeURIComponent(reportId)}`),
};
