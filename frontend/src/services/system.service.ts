import { get } from "./api";
import { SystemStatusResponse } from "./types";

export const systemService = {
  getSystemStatus: () => get<SystemStatusResponse>("/system/status"),
};
