import time
import os
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import ValidationError
from enum import Enum

class DomainEnum(str, Enum):
    sdg = "sdg"
    environmental = "environmental"
    policy = "policy"
    finance = "finance"
    research = "research"

from app.schemas.documents import UploadDocumentResponse
from app.rag.config import DOMAINS, RAW_DATA_DIR
from app.config.settings import settings
from app.core.exceptions import ValidationException, AgentException, EarthMindException
from app.rag.ingest import ingest_uploaded_pdf
from app.rag.vector_store import is_pdf_indexed
from app.core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["Documents"])

class Domain(str, Enum):
    sdg = "sdg"
    environmental = "environmental"
    policy = "policy"
    finance = "finance"
    research = "research"

@router.post("/documents/upload", response_model=UploadDocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    domain: DomainEnum = Form(...)
):
    start_time = time.perf_counter()
    domain_str = domain.value
    logger.info(f"Upload started: filename={file.filename}, domain={domain_str}")

    # Domain validation is now handled automatically by FastAPI thanks to DomainEnum!

    # Validate extension
    if not file.filename.lower().endswith('.pdf'):
        logger.error(f"Invalid file extension: {file.filename}")
        raise ValidationException("Only .pdf files are allowed.")

    # Validate MIME type
    if file.content_type != "application/pdf":
        logger.error(f"Invalid content type: {file.content_type}")
        raise ValidationException("File must be a PDF document.")

    # Validate file size
    # We read the file to get its size, then seek back to 0
    file_bytes = await file.read()
    file_size_mb = len(file_bytes) / (1024 * 1024)
    if file_size_mb > settings.MAX_UPLOAD_SIZE_MB:
        logger.error(f"File too large: {file_size_mb:.2f} MB")
        raise ValidationException(f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB} MB.")
    await file.seek(0)

    # Save file temporarily
    domain_dir = RAW_DATA_DIR / domain_str
    domain_dir.mkdir(parents=True, exist_ok=True)
    temp_path = domain_dir / f"temp_{file.filename}"
    final_path = domain_dir / file.filename

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Disk write failure: {str(e)}", exc_info=True)
        raise EarthMindException("Failed to save the uploaded file.", status_code=500)

    # Check for duplicates
    if is_pdf_indexed(domain_str, file.filename):
        logger.info(f"Document already indexed: {file.filename} in domain {domain_str}. Deleting temporary file.")
        if temp_path.exists():
            temp_path.unlink()
        
        processing_time = time.perf_counter() - start_time
        return UploadDocumentResponse(
            document_id=file.filename,
            status="already_indexed",
            message="Document already exists in the knowledge base.",
            filename=file.filename,
            domain=domain_str,
            pages=0,
            chunks=0,
            collection=domain_str,
            processing_time=processing_time,
            indexed=False
        )

    # Move temp to final
    if final_path.exists():
        final_path.unlink()
    temp_path.rename(final_path)

    # Process ingestion
    try:
        logger.info(f"Ingesting file {file.filename} into domain {domain_str}")
        result = ingest_uploaded_pdf(domain_str, final_path)
    except Exception as e:
        logger.error(f"Ingestion failed for {file.filename}: {str(e)}", exc_info=True)
        # If ingestion fails, delete the partially processed file to prevent orphaned files
        if final_path.exists():
            final_path.unlink()
        raise AgentException(f"Failed to ingest document: {str(e)}")

    processing_time = time.perf_counter() - start_time
    
    logger.info(f"Upload completed: filename={file.filename}, domain={domain_str}, size={file_size_mb:.2f}MB, "
                f"pages={result['pages']}, chunks={result['chunks']}, "
                f"collection={result['collection']}, time={processing_time:.2f}s, success=True")

    return UploadDocumentResponse(
        document_id=file.filename,
        status="indexed",
        message="Document successfully indexed.",
        filename=result["filename"],
        domain=result["domain"],
        pages=result["pages"],
        chunks=result["chunks"],
        collection=result["collection"],
        processing_time=processing_time,
        indexed=result["indexed"]
    )
