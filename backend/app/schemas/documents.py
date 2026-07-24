from pydantic import BaseModel, Field
from typing import Optional

class UploadDocumentResponse(BaseModel):
    document_id: Optional[str] = Field(
        None, 
        description="Unique identifier for the indexed document, if applicable"
    )
    status: str = Field(
        ..., 
        description="Status of the upload: 'indexed', 'already_indexed', etc."
    )
    message: str = Field(
        ..., 
        description="Human-readable message regarding the upload"
    )
    filename: str = Field(
        ..., 
        description="Name of the uploaded file"
    )
    domain: str = Field(
        ..., 
        description="The domain where the file was saved"
    )
    pages: int = Field(
        0, 
        description="Number of pages successfully processed"
    )
    chunks: int = Field(
        0, 
        description="Number of vector chunks generated"
    )
    collection: str = Field(
        ..., 
        description="The ChromaDB collection name"
    )
    processing_time: float = Field(
        0.0, 
        description="Time taken to process the document in seconds"
    )
    indexed: bool = Field(
        ..., 
        description="True if new embeddings were generated, False otherwise"
    )

class DocumentItem(BaseModel):
    id: str
    filename: str
    domain: str
    chunks: int
    size: int
    uploaded_at: Optional[str] = None

class DocumentListResponse(BaseModel):
    items: list[DocumentItem]

