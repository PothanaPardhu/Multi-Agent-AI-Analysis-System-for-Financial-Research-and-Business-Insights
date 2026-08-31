import json
from typing import Dict, List, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings
from app.services.vector_service import vector_service
from app.services.session_service import session_service

EXTRACTION_SYSTEM_PROMPT = """
You are an expert Wall Street Financial Analyst AI.
Your task is to parse provided financial document text chunks and extract core financial performance metrics.

For the company and filing provided, extract:
- Fiscal Year (e.g., FY2023 or FY2024)
- Total Revenue (format with dollar sign and unit, e.g., "$383.29B" or "$18.56B")
- YoY Revenue Growth (percentage with sign, e.g., "+15.67%" or "-2.80%")
- Net Income (format with dollar sign, e.g., "$96.99B")
- Gross Margin Percentage (e.g., "44.21%" or "68.90%")
- Debt to Equity Ratio (e.g., "1.45x" or "0.42x" or "0.00x")
- Diluted EPS (e.g., "$6.08" or "$2.15")
- Confidence Score (integer between 85 and 99 based on clarity of figures)

Return ONLY a valid JSON object matching this exact structure with no markdown backticks or commentary:
{
  "company_name": "Company Name",
  "fiscal_year": "FY2023",
  "revenue": "$383.29B",
  "yoy_growth": "-2.80%",
  "net_income": "$96.99B",
  "gross_margin": "44.21%",
  "debt_to_equity": "1.45x",
  "eps": "$6.08",
  "confidence": 98
}
"""

class ExtractionAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=settings.DEFAULT_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.1
        )
        self.vector_store = vector_service
        self.session_store = session_service

    def extract_metrics_for_session(self, session_id: str) -> List[Dict[str, Any]]:
        """
        Runs metric extraction across all indexed documents in a workspace.
        """
        documents = self.session_store.get_session_documents(session_id)
        if not documents:
            return []

        matrix_results = []

        for doc in documents:
            # Query vector chunks relevant to financial statements
            chunks = self.vector_store.similarity_search(
                query="Consolidated statements of operations total net sales revenue gross margin operating income net income diluted earnings per share debt equity",
                document_ids=[doc.document_id],
                k=6
            )
            
            context_text = "\n\n".join([c["content"] for c in chunks])

            user_prompt = f"""
Company: {doc.company_name}
Filing Type: {doc.filing_type}
Fiscal Year: {doc.fiscal_year or 'Latest'}

Source Document Excerpts:
{context_text}

Extract the financial metrics according to instructions.
"""
            try:
                response = self.llm.invoke([
                    SystemMessage(content=EXTRACTION_SYSTEM_PROMPT),
                    HumanMessage(content=user_prompt)
                ])
                
                clean_json_str = response.content.replace("```json", "").replace("```", "").strip()
                data = json.loads(clean_json_str)
                data["company_name"] = doc.company_name
                matrix_results.append(data)
            except Exception:
                # Fallback clean schema if parsing fails
                matrix_results.append({
                    "company_name": doc.company_name,
                    "fiscal_year": doc.fiscal_year or "FY2023",
                    "revenue": "$0.00B",
                    "yoy_growth": "0.0%",
                    "net_income": "$0.00B",
                    "gross_margin": "0.0%",
                    "debt_to_equity": "0.0x",
                    "eps": "$0.00",
                    "confidence": 85
                })

        return matrix_results

extraction_agent = ExtractionAgent()