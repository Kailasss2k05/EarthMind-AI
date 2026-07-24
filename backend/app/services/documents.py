from app.rag.vector_store import get_documents, delete_document
from typing import List, Dict

class DocumentService:
    def get_all_documents(self) -> List[Dict]:
        """
        Retrieves all documents by delegating to vector_store.py
        """
        return get_documents()

    def delete_document(self, document_id: str) -> None:
        """
        Deletes a document by parsing its identifier.
        document_id should be in the format 'domain:filename'
        """
        if ":" not in document_id:
            raise ValueError("Invalid document_id format. Expected 'domain:filename'")
        domain, filename = document_id.split(":", 1)
        delete_document(domain, filename)

document_service = DocumentService()
