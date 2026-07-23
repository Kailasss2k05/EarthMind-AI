import { get, del } from "./api";
import { DocumentListResponse } from "./types";

export const documentService = {
  getDocuments: () => get<DocumentListResponse>("/documents"),
  deleteDocument: (id: string) => del<{ status: string; message: string }>(`/documents?id=${encodeURIComponent(id)}`),
};
