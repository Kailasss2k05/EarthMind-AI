import { get, del, API_BASE_URL, EarthMindApiError } from "./api";
import { DocumentListResponse } from "./types";

export const documentService = {
  getDocuments: () => get<DocumentListResponse>("/documents"),
  deleteDocument: (id: string) => del<{ status: string; message: string }>(`/documents?id=${encodeURIComponent(id)}`),
  getDownloadUrl: (id: string) => `${API_BASE_URL}/api/v1/documents/download?id=${encodeURIComponent(id)}`,
  uploadDocument: async (file: File, domain: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("domain", domain);

    const response = await fetch(`${API_BASE_URL}/api/v1/documents/upload`, {
      method: "POST",
      body: formData,
    });
    
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new EarthMindApiError(
        response.status,
        body?.detail?.[0]?.msg ?? body?.error ?? `Request failed with HTTP ${response.status}`,
      );
    }
    return body;
  }
};
