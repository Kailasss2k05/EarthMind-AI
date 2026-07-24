from pydantic import BaseModel
from typing import List

class DomainStats(BaseModel):
    domain: str
    documents: int
    chunks: int

class RecentUpload(BaseModel):
    id: str
    filename: str
    domain: str
    size: int
    uploaded_at: str

class KnowledgeBaseResponse(BaseModel):
    total_documents: int
    total_chunks: int
    collections: List[DomainStats]
    recent_uploads: List[RecentUpload]
