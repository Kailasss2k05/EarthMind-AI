from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
from collections import defaultdict

from app.models.query_history import QueryHistory
from app.models.report_history import ReportHistory
from app.rag.vector_store import get_collection_statistics, get_recent_uploads

class AnalyticsService:
    def get_analytics(self, db: Session) -> dict:
        """
        Aggregate metrics for daily, weekly, and monthly buckets.
        Currently, constructs daily metrics from DB and returns empty for weekly/monthly
        to support frontend expansion.
        """
        # 1. Fetch QueryHistory for daily queries
        queries = db.query(QueryHistory).all()
        daily_queries = defaultdict(int)
        agent_stats = defaultdict(lambda: {"executions": 0, "total_time": 0.0, "last_run": None})
        
        for q in queries:
            dt_str = q.created_at.strftime("%Y-%m-%d") if hasattr(q.created_at, "strftime") else str(q.created_at)[:10]
            daily_queries[dt_str] += 1
            
            # Simple heuristic for agent_statistics
            agent_type = "planner" if q.planner_output else "research"
            agent_stats[agent_type]["executions"] += 1
            agent_stats[agent_type]["total_time"] += (q.execution_time or 0)
            
            # For simplicity, we assume records might not be perfectly ordered
            q_date = q.created_at.isoformat() if hasattr(q.created_at, "isoformat") else str(q.created_at)
            if not agent_stats[agent_type]["last_run"] or q_date > agent_stats[agent_type]["last_run"]:
                agent_stats[agent_type]["last_run"] = q_date

        # Format agent_stats
        formatted_agent_stats = {}
        for agent, stats in agent_stats.items():
            formatted_agent_stats[agent] = {
                "executions": stats["executions"],
                "last_run": stats["last_run"],
                "average_execution_time": stats["total_time"] / stats["executions"] if stats["executions"] else 0.0
            }

        # 2. Fetch ReportHistory for reports generated
        reports = db.query(ReportHistory).all()
        daily_reports = defaultdict(int)
        for r in reports:
            dt_str = r.created_at.strftime("%Y-%m-%d") if hasattr(r.created_at, "strftime") else str(r.created_at)[:10]
            daily_reports[dt_str] += 1

        # 3. Vector Store stats
        col_stats = get_collection_statistics()
        docs_per_domain = {col["domain"]: col["documents"] for col in col_stats}
        chunks_per_domain = {col["domain"]: col["chunks"] for col in col_stats}
        
        recent_uploads = get_recent_uploads(limit=100)
        daily_uploads = defaultdict(int)
        for u in recent_uploads:
            # uploaded_at is ISO format string
            dt_str = u["uploaded_at"][:10]
            daily_uploads[dt_str] += 1

        # Format time buckets
        def format_timeseries(data_dict):
            return [{"date": k, "value": v} for k, v in sorted(data_dict.items())]

        empty_bucket = {
            "queries_per_period": [],
            "reports_generated_per_period": [],
            "documents_uploaded_per_period": [],
            "knowledge_growth_per_period": []
        }

        daily_bucket = {
            "queries_per_period": format_timeseries(daily_queries),
            "reports_generated_per_period": format_timeseries(daily_reports),
            "documents_uploaded_per_period": format_timeseries(daily_uploads),
            "knowledge_growth_per_period": format_timeseries(daily_uploads) # Simplified mapping
        }

        return {
            "daily": daily_bucket,
            "weekly": empty_bucket,
            "monthly": empty_bucket,
            "documents_per_domain": docs_per_domain,
            "chunks_per_domain": chunks_per_domain,
            "agent_statistics": formatted_agent_stats
        }

analytics_service = AnalyticsService()
