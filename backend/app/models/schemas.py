import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

# ==========================================
# 1. Research Workspace & Session Schemas
# ==========================================
class SessionCreate(BaseModel):
    title: str = Field(..., description="Name of the research workspace/session")
    description: Optional[str] = Field(None, description="Optional brief description")

class SessionResponse(BaseModel):
    session_id: str
    title: str
    description: Optional[str]
    created_at: datetime
    document_count: int = 0

# ==========================================
# 2. Document Agent & Ingestion Schemas
# ==========================================
class DocumentMetadata(BaseModel):
    document_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    file_name: str
    company_name: str = "Unknown"
    filing_type: str = "10-K"  # 10-K, 10-Q, Annual Report
    fiscal_year: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    total_pages: int = 0
    status: str = "indexed"  # pending, indexed, failed

class DocumentChunk(BaseModel):
    chunk_id: str
    document_id: str
    session_id: str
    page_number: int
    content: str
    metadata: Dict[str, Any] = {}

# ==========================================
# 3. Extraction Agent Schemas
# ==========================================
class FinancialMetricItem(BaseModel):
    metric_name: str = Field(..., description="e.g. Total Revenue, Net Income, Operating Margin")
    value: str = Field(..., description="Extracted numerical value or ratio")
    unit: str = Field(..., description="USD, %, Millions, Billions, etc.")
    fiscal_year: str = Field(..., description="Target reporting period, e.g. FY2023")
    page_reference: int = Field(..., description="Exact page in the filing")
    raw_source_snippet: str = Field(..., description="Exact excerpt supporting the value")

class ExtractionResult(BaseModel):
    document_id: str
    company_name: str
    fiscal_year: Optional[str]
    metrics: List[FinancialMetricItem] = []

# ==========================================
# 4. Red Flag Agent Schemas
# ==========================================
class RedFlagItem(BaseModel):
    risk_title: str = Field(..., description="e.g. Rising Debt Load, Falling Operating Margin")
    severity: str = Field(..., description="Low, Medium, High, Critical")
    category: str = Field(..., description="Debt, Margins, Auditor Qualification, Legal, Accounting Anomaly")
    observation: str = Field(..., description="Detailed analyst-style explanation of the risk")
    page_reference: int = Field(..., description="Exact source page number")
    citation_quote: str = Field(..., description="Strict quote from the document proving the red flag")

class RedFlagResult(BaseModel):
    document_id: str
    company_name: str
    red_flags: List[RedFlagItem] = []

# ==========================================
# 5. Research Agent & Conversational Q&A Schemas
# ==========================================
class Citation(BaseModel):
    document_id: str
    company_name: str
    file_name: str
    page_number: int
    snippet: str

class QueryRequest(BaseModel):
    session_id: str
    question: str
    selected_document_ids: Optional[List[str]] = None

class QueryResponse(BaseModel):
    question: str
    answer: str
    reasoning_steps: List[str] = []
    citations: List[Citation] = []