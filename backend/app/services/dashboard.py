from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.models.query_history import QueryHistory
from app.models.report_history import ReportHistory
from app.schemas.dashboard import (
    DashboardStatsResponse,
    QueriesStats,
    ReportsStats,
    KnowledgeBaseStats,
    RecentUpload,
)
from app.schemas.history import QueryHistoryItem, ReportHistoryItem
from app.rag.vector_store import get_dashboard_statistics

class DashboardService:

    def _get_recent_uploads(self, limit: int = 5) -> list[dict]:
        """
        Helper method to get recent uploads.
        Currently scans RAW_DATA_DIR for PDF files and sorts by modification time.
        Designed so it can be replaced with a database query later without changing the API.
        """
        from app.rag.config import RAW_DATA_DIR
        
        uploads = []
        if RAW_DATA_DIR.exists():
            for filepath in RAW_DATA_DIR.rglob("*.pdf"):
                stat = filepath.stat()
                uploaded_at = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc)
                uploads.append({
                    "filename": filepath.name,
                    "domain": filepath.parent.name,
                    "uploaded_at": uploaded_at
                })
        
        uploads.sort(key=lambda x: x["uploaded_at"], reverse=True)
        return uploads[:limit]

    def get_statistics(self, db: Session) -> DashboardStatsResponse:
        """
        Gathers all statistics required for the dashboard.
        """
        # Queries aggregate
        status_counts = db.query(QueryHistory.status, func.count(QueryHistory.id)).group_by(QueryHistory.status).all()
        
        total_q = sum(count for _, count in status_counts)
        completed_q = next((count for status, count in status_counts if status == 'completed'), 0)
        failed_q = next((count for status, count in status_counts if status == 'failed'), 0)
        processing_q = next((count for status, count in status_counts if status == 'processing'), 0)
        
        queries_stats = QueriesStats(
            total=total_q,
            completed=completed_q,
            failed=failed_q,
            processing=processing_q
        )
        
        # Reports aggregate
        total_reports = db.query(ReportHistory).count()
        reports_stats = ReportsStats(total=total_reports)
        
        # Knowledge Base stats
        kb_stats_data = get_dashboard_statistics()
        kb_stats = KnowledgeBaseStats(**kb_stats_data)
        
        # Recent Queries
        recent_q_records = db.query(QueryHistory).order_by(QueryHistory.created_at.desc()).limit(5).all()
        recent_queries = [QueryHistoryItem.model_validate(q) for q in recent_q_records]
        
        # Recent Reports
        recent_r_records = (
            db.query(ReportHistory)
            .options(joinedload(ReportHistory.query))
            .order_by(ReportHistory.created_at.desc())
            .limit(5)
            .all()
        )
        
        recent_reports = [
            ReportHistoryItem(
                id=r.id,
                query_id=r.query_id,
                original_query=r.query.query,
                status=r.query.status,
                created_at=r.created_at
            ) for r in recent_r_records
        ]
        
        # Recent Uploads
        recent_ups = self._get_recent_uploads(limit=5)
        recent_uploads = [RecentUpload(**u) for u in recent_ups]
        
        return DashboardStatsResponse(
            generated_at=datetime.now(timezone.utc),
            queries=queries_stats,
            reports=reports_stats,
            knowledge_base=kb_stats,
            recent_queries=recent_queries,
            recent_reports=recent_reports,
            recent_uploads=recent_uploads
        )

dashboard_service = DashboardService()
