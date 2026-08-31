import os
from typing import Any, Dict, List, Optional
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.core.config import settings
from app.models.schemas import DocumentChunk

class VectorService:
    def __init__(self):
        # Initialize Google GenAI Embeddings
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            google_api_key=api_key
        )
        
        # Initialize Persistent ChromaDB Vector Store
        self.vector_store = Chroma(
            collection_name="financial_documents",
            embedding_function=self.embeddings,
            persist_directory=str(settings.CHROMA_PERSIST_DIR)
        )

    def add_chunks(self, chunks: List[DocumentChunk]):
        """
        Embeds and stores document chunks with associated metadata.
        """
        if not chunks:
            return

        texts = [chunk.content for chunk in chunks]
        metadatas = [chunk.metadata for chunk in chunks]
        ids = [chunk.chunk_id for chunk in chunks]

        self.vector_store.add_texts(
            texts=texts,
            metadatas=metadatas,
            ids=ids
        )

    def similarity_search(
        self,
        query: str,
        session_id: Optional[str] = None,
        document_ids: Optional[List[str]] = None,
        k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Performs similarity search with session/document metadata filtering.
        """
        filter_dict = {}
        if session_id and not document_ids:
            filter_dict = {"session_id": session_id}
        elif document_ids:
            if len(document_ids) == 1:
                filter_dict = {"document_id": document_ids[0]}
            else:
                filter_dict = {"document_id": {"$in": document_ids}}

        results = self.vector_store.similarity_search_with_score(
            query=query,
            k=k,
            filter=filter_dict if filter_dict else None
        )

        formatted_results = []
        for doc, score in results:
            formatted_results.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "score": float(score)
            })

        return formatted_results

vector_service = VectorService()