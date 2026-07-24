import { get } from "./api";
import { AnalyticsResponse } from "./types";

export const analyticsService = {
  getAnalytics: () => get<AnalyticsResponse>("/analytics"),
};
