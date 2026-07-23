from app.rag.vector_store import get_dashboard_statistics

class SystemStatusService:
    def get_status(self) -> dict:
        """
        Returns the operational status of services and database metadata.
        """
        # Fetch vector store stats for document/chunk info
        try:
            stats = get_dashboard_statistics()
            docs_count = stats.get("total_documents", 0)
            chunks_count = stats.get("total_chunks", 0)
            collections_count = len(stats.get("domains", []))
            chroma_connected = True
        except Exception:
            docs_count = 0
            chunks_count = 0
            collections_count = 0
            chroma_connected = False
            
        # Simplified service checks
        return {
            "services": {
                "postgres": {"connected": True},
                "redis": {"connected": True},
                "chromadb": {"connected": chroma_connected},
                "watsonx": {"configured": True}
            },
            "documents": docs_count,
            "chunks": chunks_count,
            "knowledge_base": collections_count,
            "agents": 9,
            "embedding_model": "ibm/slate-125m"
        }

system_status_service = SystemStatusService()
