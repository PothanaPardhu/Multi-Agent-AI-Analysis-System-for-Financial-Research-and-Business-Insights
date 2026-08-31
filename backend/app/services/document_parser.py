import uuid
from pathlib import Path
from typing import List
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.models.schemas import DocumentChunk

class DocumentParserService:
    def __init__(self, chunk_size: int = 1200, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def parse_pdf(
        self,
        file_path: Path,
        document_id: str,
        session_id: str,
        company_name: str = "Unknown"
    ) -> tuple[int, List[DocumentChunk]]:
        """
        Parses a PDF file page by page, chunks the text, and attaches exact page metadata.
        Returns total page count and the list of DocumentChunk objects.
        """
        reader = PdfReader(str(file_path))
        total_pages = len(reader.pages)
        chunks: List[DocumentChunk] = []

        for page_idx, page in enumerate(reader.pages):
            page_num = page_idx + 1
            raw_text = page.extract_text() or ""
            cleaned_text = raw_text.strip()
            
            if not cleaned_text:
                continue

            # Split text within the page to keep chunks bounded to their source page
            page_splits = self.text_splitter.split_text(cleaned_text)

            for split_text in page_splits:
                chunk = DocumentChunk(
                    chunk_id=str(uuid.uuid4()),
                    document_id=document_id,
                    session_id=session_id,
                    page_number=page_num,
                    content=split_text,
                    metadata={
                        "company_name": company_name,
                        "file_name": file_path.name,
                        "page_number": page_num,
                        "document_id": document_id,
                        "session_id": session_id
                    }
                )
                chunks.append(chunk)

        return total_pages, chunks

document_parser_service = DocumentParserService()