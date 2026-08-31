import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from app.models.schemas import SessionCreate, SessionResponse, DocumentMetadata
from app.core.config import settings

class SessionService:
    def __init__(self, storage_file: Path = settings.BASE_DIR / "data" / "sessions.json"):
        self.storage_file = storage_file
        self.sessions: Dict[str, dict] = {}
        self.documents: Dict[str, List[dict]] = {}  # session_id -> list of DocumentMetadata dicts
        self._load_from_disk()

    def _load_from_disk(self):
        if self.storage_file.exists():
            try:
                with open(self.storage_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.sessions = data.get("sessions", {})
                    self.documents = data.get("documents", {})
            except Exception:
                self.sessions = {}
                self.documents = {}

    def _save_to_disk(self):
        self.storage_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.storage_file, "w", encoding="utf-8") as f:
            json.dump({
                "sessions": self.sessions,
                "documents": self.documents
            }, f, default=str, indent=2)

    def create_session(self, session_in: SessionCreate) -> SessionResponse:
        session_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        session_data = {
            "session_id": session_id,
            "title": session_in.title,
            "description": session_in.description,
            "created_at": now.isoformat(),
            "document_count": 0
        }
        
        self.sessions[session_id] = session_data
        self.documents[session_id] = []
        self._save_to_disk()
        
        return SessionResponse(
            session_id=session_id,
            title=session_data["title"],
            description=session_data["description"],
            created_at=now,
            document_count=0
        )

    def get_all_sessions(self) -> List[SessionResponse]:
        results = []
        for s in self.sessions.values():
            docs = self.documents.get(s["session_id"], [])
            results.append(
                SessionResponse(
                    session_id=s["session_id"],
                    title=s["title"],
                    description=s.get("description"),
                    created_at=datetime.fromisoformat(s["created_at"]),
                    document_count=len(docs)
                )
            )
        return results

    def get_session(self, session_id: str) -> Optional[SessionResponse]:
        s = self.sessions.get(session_id)
        if not s:
            return None
        docs = self.documents.get(session_id, [])
        return SessionResponse(
            session_id=s["session_id"],
            title=s["title"],
            description=s.get("description"),
            created_at=datetime.fromisoformat(s["created_at"]),
            document_count=len(docs)
        )

    def add_document_to_session(self, session_id: str, doc_meta: DocumentMetadata):
        if session_id not in self.documents:
            self.documents[session_id] = []
        self.documents[session_id].append(doc_meta.model_dump())
        self._save_to_disk()

    def get_session_documents(self, session_id: str) -> List[DocumentMetadata]:
        doc_list = self.documents.get(session_id, [])
        return [DocumentMetadata(**d) for d in doc_list]

session_service = SessionService()