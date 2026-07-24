import { get } from "./api";
import { KnowledgeBaseResponse } from "./types";

export const knowledgeBaseService = {
  getKnowledgeBase: () => get<KnowledgeBaseResponse>("/knowledge-base"),
};
