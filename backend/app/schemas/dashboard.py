from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

from app.schemas.history import QueryHistoryItem, ReportHistoryItem

class QueriesStats(BaseModel):
    total: int = Field(0, description="Total number of queries")
    completed: int = Field(0, description="Number of completed queries")
    failed: int = Field(0, description="Number of failed queries")
    processing: int = Field(0, description="Number of queries currently processing")

class ReportsStats(BaseModel):
    total: int = Field(0, description="Total number of generated reports")

class DomainStats(BaseModel):
    domain: str = Field(description="The knowledge domain")
    documents: int = Field(0, description="Total unique documents in this domain")
    chunks: int = Field(0, description="Total text chunks in this domain")

class KnowledgeBaseStats(BaseModel):
    total_documents: int = Field(0, description="Total indexed documents across all domains")
    total_chunks: int = Field(0, description="Total indexed chunks across all domains")
    domains: list[DomainStats] = Field(default_factory=list, description="Per-domain statistics")

class RecentUpload(BaseModel):
    filename: str = Field(description="Name of the uploaded file")
    domain: str = Field(description="The target domain")
    uploaded_at: datetime = Field(description="Timestamp of the file upload (modification time)")

class DashboardStatsResponse(BaseModel):
    generated_at: datetime = Field(description="UTC timestamp of when these statistics were generated")
    queries: QueriesStats
    reports: ReportsStats
    knowledge_base: KnowledgeBaseStats
    recent_queries: list[QueryHistoryItem] = Field(default_factory=list)
    recent_reports: list[ReportHistoryItem] = Field(default_factory=list)
    recent_uploads: list[RecentUpload] = Field(default_factory=list)
