import { get } from "./api";
import { HistoryListResponse } from "./types";

export const historyService = {
  getHistory: (skip = 0, limit = 100, query = "", sort = "desc") => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      sort,
    });
    if (query) params.append("query", query);
    
    return get<HistoryListResponse>(`/history?${params.toString()}`);
  },
};
