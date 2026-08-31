from typing import Dict, Any
from app.agents.extraction_agent import extraction_agent
from app.agents.red_flag_agent import red_flag_agent
from app.agents.comparison_agent import comparison_agent
from app.services.session_service import session_service

class ReportAgent:
    def __init__(self):
        self.session_store = session_service
        self.extractor = extraction_agent
        self.red_flags = red_flag_agent
        self.comparison = comparison_agent

    def compile_full_dossier(self, session_id: str) -> Dict[str, Any]:
        """
        Orchestrates cross-agent outputs into an institutional research report.
        """
        docs = self.session_store.get_session_documents(session_id)
        metrics = self.extractor.extract_metrics_for_session(session_id)
        flags = self.red_flags.audit_session_red_flags(session_id)
        benchmark = self.comparison.generate_comparison(session_id)

        report_title = f"Multi-Company Comparative Financial Assessment & Risk Audit"
        
        return {
            "meta": {
                "report_title": report_title,
                "session_id": session_id,
                "total_companies_covered": len(docs),
                "generated_at": "2026-09-01",
                "framework_version": "MAFRS v2.0 - Multi-Agent Architecture"
            },
            "executive_summary": benchmark.get("executive_summary", "Comprehensive multi-agent financial audit."),
            "leader_takeaway": benchmark.get("leader_takeaway", "Evaluation concluded across indexed cohort."),
            "high_risk_warning": benchmark.get("high_risk_warning", "Monitor legal and supply chain disclosures."),
            "financial_matrix": metrics,
            "rankings": benchmark.get("rankings", []),
            "red_flags": flags,
            "documents_audited": [
                {
                    "company_name": d.company_name,
                    "filing_type": d.filing_type,
                    "pages": d.total_pages,
                    "fiscal_year": d.fiscal_year or "FY2023"
                }
                for d in docs
            ]
        }

report_agent = ReportAgent()