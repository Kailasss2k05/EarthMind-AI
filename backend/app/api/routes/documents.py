import time
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from enum import Enum

from app.schemas.documents import UploadDocumentResponse, DocumentListResponse
from app.rag.config import DOMAINS, RAW_DATA_DIR
from app.config.settings import settings
from app.core.exceptions import ValidationException, AgentException, EarthMindException
from app.rag.ingest import ingest_uploaded_pdf
from app.rag.vector_store import is_pdf_indexed
from app.core.logger import get_logger
from app.services.documents import document_service

logger = get_logger(__name__)
router = APIRouter(tags=["Documents"])


class DomainEnum(str, Enum):
    """
    Valid upload domains. Values are kept in sync with config.DOMAINS.
    Using a class-based enum (not the Enum() factory) because FastAPI/Pydantic
    requires a proper class for correct form field validation and OpenAPI schema generation.
    """
    sdg = "sdg"
    environmental = "environmental"
    policy = "policy"
    finance = "finance"
    research = "research"


@router.post("/documents/upload", response_model=UploadDocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    domain: DomainEnum = Form(...),
):
    start_time = time.perf_counter()
    domain_str: str = domain.value
    logger.info(f"Upload started: filename={file.filename}, domain={domain_str}")

    # Validate extension
    if not file.filename.lower().endswith(".pdf"):
        logger.error(f"Invalid file extension: {file.filename}")
        raise ValidationException("Only .pdf files are allowed.")

    # MIME type is client-supplied and unreliable — log it for debug but don't reject.
    # Real validation happens via magic bytes below.
    logger.info(f"Received content_type={file.content_type} for {file.filename}")

    # Read file bytes once — used for size check, magic-byte validation, and disk write
    file_bytes = await file.read()

    # Verify PDF magic bytes (%PDF) — content_type alone is client-supplied and bypassable
    if not file_bytes.startswith(b"%PDF"):
        logger.error(f"File does not start with PDF magic bytes: {file.filename}")
        raise ValidationException("File is not a valid PDF document.")

    file_size_mb = len(file_bytes) / (1024 * 1024)
    if file_size_mb > settings.MAX_UPLOAD_SIZE_MB:
        logger.error(f"File too large: {file_size_mb:.2f} MB")
        raise ValidationException(
            f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB} MB."
        )

    # Prepare paths
    domain_dir = RAW_DATA_DIR / domain_str
    domain_dir.mkdir(parents=True, exist_ok=True)
    temp_path = domain_dir / f"temp_{file.filename}"
    final_path = domain_dir / file.filename

    # Write bytes directly to disk (no second read from cursor — fixes C-3)
    try:
        with open(temp_path, "wb") as buffer:
            buffer.write(file_bytes)
    except Exception as e:
        logger.error(f"Disk write failure: {str(e)}", exc_info=True)
        raise EarthMindException("Failed to save the uploaded file.", status_code=500)

    # Check for duplicates after writing temp file
    if is_pdf_indexed(domain_str, file.filename):
        logger.info(
            f"Document already indexed: {file.filename} in domain {domain_str}. "
            "Deleting temporary file."
        )
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
            indexed=False,
        )

    # Move temp → final using shutil.move (safe across Windows filesystem boundaries — L-5)
    if final_path.exists():
        final_path.unlink()
    shutil.move(str(temp_path), str(final_path))

    # Ingest
    try:
        logger.info(f"Ingesting file {file.filename} into domain {domain_str}")
        result = ingest_uploaded_pdf(domain_str, final_path)
    except Exception as e:
        logger.error(f"Ingestion failed for {file.filename}: {str(e)}", exc_info=True)
        if final_path.exists():
            final_path.unlink()
        raise AgentException(f"Failed to ingest document: {str(e)}")

    processing_time = time.perf_counter() - start_time

    logger.info(
        f"Upload completed: filename={file.filename}, domain={domain_str}, "
        f"size={file_size_mb:.2f}MB, pages={result['pages']}, chunks={result['chunks']}, "
        f"collection={result['collection']}, time={processing_time:.2f}s"
    )

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
        indexed=result["indexed"],
    )


@router.get("/documents", response_model=DocumentListResponse)
def list_documents():
    """List all documents across all domains."""
    logger.info("Fetching all documents")
    items = document_service.get_all_documents()
    return DocumentListResponse(items=items)


@router.delete("/documents")
def delete_document(id: str):
    """Delete a document by its ID (format: domain:filename)."""
    logger.info(f"Deleting document with id: {id}")
    try:
        document_service.delete_document(id)
        return {"status": "success", "message": f"Document {id} deleted successfully."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to delete document {id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to delete document.")


@router.get("/documents/download")
def download_document(id: str):
    """Download a document by its ID (format: domain:filename)."""
    logger.info(f"Downloading document with id: {id}")
    try:
        parts = id.split(":", 1)
        if len(parts) != 2:
            raise ValueError(f"Invalid document id format: {id}")
        domain_str, filename = parts

        # Validate domain against the allowlist — prevents path traversal (H-4)
        if domain_str not in DOMAINS:
            raise HTTPException(status_code=400, detail=f"Unknown domain: {domain_str}")

        # Resolve and confirm the path stays inside RAW_DATA_DIR (H-4)
        base = RAW_DATA_DIR.resolve()
        file_path = (base / domain_str / filename).resolve()
        if not str(file_path).startswith(str(base)):
            raise HTTPException(status_code=400, detail="Invalid file path.")

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        media_type = (
            "application/pdf"
            if filename.lower().endswith(".pdf")
            else "application/octet-stream"
        )

        return FileResponse(
            path=file_path,
            filename=filename,
            media_type=media_type,
            content_disposition_type="inline",
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to download document {id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to download document.")
