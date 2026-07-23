import { get } from "./api";
import { AgentStatusResponse } from "./types";

export const agentService = {
  getAgentStatus: () => get<AgentStatusResponse>("/agents/status"),
};
