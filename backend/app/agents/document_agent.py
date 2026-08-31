from pathlib import Path
from typing import Dict, Any, List
from app.models.schemas import DocumentMetadata, DocumentChunk
from app.services.document_parser import document_parser_service
from app.services.vector_service import vector_service
from app.services.session_service import session_service

class DocumentAgent:
    """
    Document Agent: Handles document upload, parsing, chunking, 
    embedding generation, and vector database indexing.
    """
    def __init__(self):
        self.parser = document_parser_service
        self.vector_store = vector_service
        self.session_store = session_service

    def process_and_index_document(
        self,
        file_path: Path,
        session_id: str,
        company_name: str = "Unknown",
        filing_type: str = "10-K",
        fiscal_year: str = None
    ) -> DocumentMetadata:
        """
        Executes end-to-end ingestion pipeline for a financial filing.
        """
        # 1. Initialize Document Metadata
        doc_meta = DocumentMetadata(
            session_id=session_id,
            file_name=file_path.name,
            company_name=company_name,
            filing_type=filing_type,
            fiscal_year=fiscal_year,
            status="processing"
        )

        try:
            # 2. Parse and chunk the PDF
            total_pages, chunks = self.parser.parse_pdf(
                file_path=file_path,
                document_id=doc_meta.document_id,
                session_id=session_id,
                company_name=company_name
            )

            # 3. Generate embeddings and index in ChromaDB
            self.vector_store.add_chunks(chunks)

            # 4. Update metadata status
            doc_meta.total_pages = total_pages
            doc_meta.status = "indexed"

        except Exception as e:
            doc_meta.status = "failed"
            raise RuntimeError(f"Document processing failed for {file_path.name}: {str(e)}")

        # 5. Persist document metadata within session workspace
        self.session_store.add_document_to_session(session_id, doc_meta)
        return doc_meta

document_agent = DocumentAgent()