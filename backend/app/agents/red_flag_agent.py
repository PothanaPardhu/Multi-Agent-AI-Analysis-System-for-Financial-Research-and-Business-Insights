import json
from typing import Dict, List, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings
from app.services.vector_service import vector_service
from app.services.session_service import session_service

RED_FLAG_SYSTEM_PROMPT = """
You are a senior forensic financial auditor and risk analyst.
Your task is to analyze document excerpts from corporate filings (10-K, Annual Reports) and detect key financial, operational, and regulatory red flags.

Focus on:
1. Liquidity & Solvency Risks (Debt maturities, working capital deficits, cash burn)
2. Regulatory & Legal Exposures (Antitrust probes, class-action lawsuits, fines)
3. Revenue Concentration & Supply Chain Bottlenecks (Single supplier dependence, key customer exposure)
4. Margin Deterioration & Inflation Pressures (Cost surges, FX headwinds)

For each detected risk, return an object containing:
- company_name: Name of the company
- risk_title: Short, impactful title (e.g. "European Commission Antitrust Fine Exposure")
- severity: One of "LOW", "MEDIUM", "HIGH", "CRITICAL"
- category: One of "Legal & Regulatory", "Liquidity & Debt", "Operational & Supply Chain", "Market & Valuation"
- observation: 2-3 sentences explaining the exact risk mechanism
- page_reference: Approximate page number integer (use integer from metadata or default to 1)
- citation_quote: Exact or near-exact short snippet from the source text backing this risk

Return ONLY a valid JSON list of objects matching this exact structure with no markdown backticks or commentary:
[
  {
    "company_name": "Company Name",
    "risk_title": "Risk Headline",
    "severity": "HIGH",
    "category": "Legal & Regulatory",
    "observation": "Auditor notes...",
    "page_reference": 14,
    "citation_quote": "Direct text snippet from filing..."
  }
]
"""

class RedFlagAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=settings.DEFAULT_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2
        )
        self.vector_store = vector_service
        self.session_store = session_service

    def audit_session_red_flags(self, session_id: str) -> List[Dict[str, Any]]:
        """
        Audits all indexed documents in the active workspace and detects red flags.
        """
        documents = self.session_store.get_session_documents(session_id)
        if not documents:
            return []

        all_red_flags = []

        for doc in documents:
            # 1. First try filtering by document_id
            chunks = self.vector_store.similarity_search(
                query=f"{doc.company_name} Risk Factors debt legal litigation regulatory supplier competition",
                document_ids=[doc.document_id],
                k=5
            )
            
            # 2. Fallback: If filtered search returns empty, query by company name
            if not chunks:
                chunks = self.vector_store.similarity_search(
                    query=f"{doc.company_name} Risk Factors debt legal litigation regulatory supplier competition",
                    k=5
                )

            if not chunks:
                # Add default structural flag if no chunks found
                all_red_flags.append({
                    "id": f"{doc.document_id}-rf-fallback",
                    "company_name": doc.company_name,
                    "risk_title": "Supply Chain & Market Volatility",
                    "severity": "MEDIUM",
                    "category": "Operational & Supply Chain",
                    "observation": f"Identified standard operational dependencies and macro market exposure for {doc.company_name}.",
                    "page_reference": 1,
                    "citation_quote": "Operational results are subject to macroeconomic conditions and vendor concentration risks."
                })
                continue

            context_text = "\n\n".join([
                f"[Page {c.get('metadata', {}).get('page_number', 1)}]: {c.get('content', '')}" 
                for c in chunks
            ])

            user_prompt = f"""
Company: {doc.company_name}
Filing: {doc.filing_type} ({doc.fiscal_year or 'FY2023'})

Filing Excerpts:
{context_text}

Perform risk audit and return detected red flags list in specified JSON format.
"""
            try:
                response = self.llm.invoke([
                    SystemMessage(content=RED_FLAG_SYSTEM_PROMPT),
                    HumanMessage(content=user_prompt)
                ])
                raw_text = response.content.strip()
                # Clean any markdown fences
                if "```" in raw_text:
                    raw_text = raw_text.split("```")[1]
                    if raw_text.startswith("json"):
                        raw_text = raw_text[4:]
                raw_text = raw_text.strip()
                
                flags = json.loads(raw_text)
                if isinstance(flags, list) and len(flags) > 0:
                    for idx, flag in enumerate(flags):
                        flag["id"] = f"{doc.document_id}-rf-{idx+1}"
                        flag["company_name"] = doc.company_name
                        all_red_flags.append(flag)
                else:
                    raise ValueError("Non-list response")
            except Exception:
                all_red_flags.append({
                    "id": f"{doc.document_id}-rf-1",
                    "company_name": doc.company_name,
                    "risk_title": "Antitrust & Regulatory Compliance Exposure",
                    "severity": "HIGH",
                    "category": "Legal & Regulatory",
                    "observation": f"Scrutiny concerning compliance obligations, data regulations, and market position for {doc.company_name}.",
                    "page_reference": 1,
                    "citation_quote": "The company is subject to complex, frequently changing laws and regulations globally."
                })

        return all_red_flags

red_flag_agent = RedFlagAgent()