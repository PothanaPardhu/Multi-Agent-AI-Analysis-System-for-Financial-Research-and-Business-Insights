import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from app.core.config import settings
from app.models.schemas import DocumentMetadata, SessionCreate, SessionResponse
from app.services.session_service import session_service
from app.agents.document_agent import document_agent
from app.agents.extraction_agent import extraction_agent
from app.agents.red_flag_agent import red_flag_agent
router = APIRouter()

# ==========================================
# 1. Research Workspace & Session Endpoints
# ==========================================
@router.post("/sessions", response_model=SessionResponse)
async def create_session(session_in: SessionCreate):
    """Create a new named research workspace session."""
    return session_service.create_session(session_in)


@router.get("/sessions", response_model=List[SessionResponse])
async def list_sessions():
    """List all active research sessions."""
    return session_service.get_all_sessions()


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    """Retrieve details of a single research session."""
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Research session not found")
    return session


@router.get("/sessions/{session_id}/documents", response_model=List[DocumentMetadata])
async def get_session_documents(session_id: str):
    """List all indexed documents within a given session."""
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Research session not found")
    return session_service.get_session_documents(session_id)


# ==========================================
# 2. Document Upload & Ingestion Endpoint
# ==========================================
@router.post("/sessions/{session_id}/documents/upload", response_model=DocumentMetadata)
async def upload_document(
    session_id: str,
    file: UploadFile = File(...),
    company_name: str = Form("Unknown"),
    filing_type: str = Form("10-K"),
    fiscal_year: Optional[str] = Form(None)
):
    """
    Upload a financial PDF filing (10-K, 10-Q, Annual Report).
    Saves the file, triggers the Document Agent parser, generates embeddings,
    and indexes chunks into the vector store.
    """
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Research session not found")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF filings are supported")

    # Save uploaded file locally
    saved_path = settings.UPLOAD_DIR / f"{session_id}_{file.filename}"
    try:
        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    finally:
        file.file.close()

    # Trigger Document Agent ingestion pipeline
    try:
        doc_meta = document_agent.process_and_index_document(
            file_path=saved_path,
            session_id=session_id,
            company_name=company_name,
            filing_type=filing_type,
            fiscal_year=fiscal_year
        )
        return doc_meta
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document indexing failed: {str(e)}")
@router.get("/sessions/{session_id}/extraction/matrix")
async def get_extraction_matrix(session_id: str):
    """
    Triggers Agent A2 to extract standardized financial metrics across workspace filings.
    """
    matrix = extraction_agent.extract_metrics_for_session(session_id)
    return matrix

@router.get("/sessions/{session_id}/red-flags")
async def get_session_red_flags(session_id: str):
    """
    Triggers Agent A3 to perform risk analysis and detect audit red flags.
    """
    flags = red_flag_agent.audit_session_red_flags(session_id)
    return flags