from app.rag.vector_store import (
    get_dashboard_statistics,
    get_collection_statistics,
    get_recent_uploads,
)

class KnowledgeBaseService:
    def get_knowledge_base_stats(self) -> dict:
        """
        Orchestrates calls to vector_store to fetch Knowledge Base statistics.
        Returns data conforming to KnowledgeBaseResponse schema.
        """
        stats = get_dashboard_statistics()
        # Ensure collections key maps to domains
        stats["collections"] = stats.pop("domains", [])
        
        recent_uploads = get_recent_uploads(limit=10)
        stats["recent_uploads"] = recent_uploads
        
        return stats

knowledge_base_service = KnowledgeBaseService()
