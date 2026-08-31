import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from app.core.config import settings
from app.agents.document_agent import document_agent
from app.services.session_service import session_service
from app.models.schemas import SessionCreate

def generate_sample_pdf(file_path: Path, company_name: str, fiscal_year: str, content_pages: list):
    """Utility to generate structured sample financial PDFs for seed testing."""
    c = canvas.Canvas(str(file_path), pagesize=letter)
    
    for page_idx, page_lines in enumerate(content_pages):
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, 750, f"{company_name} - {fiscal_year} Financial Report")
        c.setFont("Helvetica", 10)
        c.drawString(50, 735, f"Form 10-K | Page {page_idx + 1}")
        c.line(50, 725, 550, 725)
        
        y = 700
        c.setFont("Helvetica", 10)
        for line in page_lines:
            c.drawString(50, y, line)
            y -= 18
            if y < 50:
                break
        c.showPage()
    
    c.save()

def load_seed_documents():
    """Generates and indexes 3-4 seed company financial documents into a default workspace."""
    seed_dir = settings.SEED_DIR
    seed_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Create or get default seed session
    existing_sessions = session_service.get_all_sessions()
    seed_session_id = None
    for s in existing_sessions:
        if s.title == "Default Seed Workspace":
            seed_session_id = s.session_id
            break
            
    if not seed_session_id:
        new_session = session_service.create_session(
            SessionCreate(
                title="Default Seed Workspace",
                description="Pre-loaded with seed company financial reports (Apple, Microsoft, Tesla, Infosys)."
            )
        )
        seed_session_id = new_session.session_id

    # 2. Seed data definitions
    seed_data = [
        {
            "company": "Apple Inc.",
            "year": "FY2023",
            "filename": "apple_fy2023_10k.pdf",
            "pages": [
                [
                    "ITEM 7. MANAGEMENT'S DISCUSSION AND ANALYSIS OF FINANCIAL CONDITION",
                    "Total net sales were $383,285 million in 2023, compared to $394,328 million in 2022, a decrease of 2.8%.",
                    "Products net sales were $298,085 million compared to $316,199 million in 2022.",
                    "Services net sales reached an all-time record of $85,200 million, up 9.0% year-over-year.",
                    "Gross margin was $169,148 million with a gross margin percentage of 44.1%."
                ],
                [
                    "CONSOLIDATED STATEMENTS OF OPERATIONS",
                    "Operating income was $114,301 million in 2023, representing an operating margin of 29.8%.",
                    "Net income was $96,995 million, down from $99,803 million in the prior fiscal year.",
                    "Total term debt stood at $106,377 million as of September 30, 2023.",
                    "Cash and cash equivalents plus marketable securities totaled $61,555 million."
                ]
            ]
        },
        {
            "company": "Microsoft Corp.",
            "year": "FY2023",
            "filename": "microsoft_fy2023_10k.pdf",
            "pages": [
                [
                    "ITEM 7. MANAGEMENT'S DISCUSSION AND ANALYSIS",
                    "Revenue was $211,915 million, an increase of 7% compared to fiscal year 2022.",
                    "Productivity and Business Processes revenue grew 8% to $69,274 million.",
                    "Intelligent Cloud revenue grew 17% to $87,907 million, driven by Azure growth.",
                    "Gross margin percentage was 68.9% with gross profit totaling $146,052 million."
                ],
                [
                    "FINANCIAL POSITION AND LIQUIDITY",
                    "Operating income increased 6% to $88,523 million with an operating margin of 41.8%.",
                    "Net Income reached $72,361 million, down slightly by 0.5% year-over-year.",
                    "Total long-term debt was $41,968 million as of June 30, 2023.",
                    "Auditor's Report: Unqualified opinion with critical audit matters related to revenue recognition."
                ]
            ]
        },
        {
            "company": "Tesla Inc.",
            "year": "FY2023",
            "filename": "tesla_fy2023_10k.pdf",
            "pages": [
                [
                    "ITEM 7. EXECUTIVE OVERVIEW AND REVENUE ANALYSIS",
                    "Total revenues were $96,773 million in 2023, representing 19% YoY growth from $81,462 million.",
                    "Automotive regulatory credits contributed $1,790 million to automotive revenues.",
                    "Total gross profit was $17,660 million, down 15% due to price reductions.",
                    "Automotive gross margin excluding regulatory credits compressed to 18.2%."
                ],
                [
                    "FINANCIAL ANOMALIES AND RISK FACTORS",
                    "Operating margin fell sharply from 16.8% in 2022 to 8.2% in 2023 due to price cuts.",
                    "Operating income decreased to $8,891 million from $13,656 million in 2022.",
                    "Total debt and finance leases excluding vehicle financing stood at $2,857 million.",
                    "Free cash flow dropped 42% YoY to $4,358 million owing to elevated capital expenditures."
                ]
            ]
        },
        {
            "company": "Infosys Limited",
            "year": "FY2024",
            "filename": "infosys_fy2024_annual_report.pdf",
            "pages": [
                [
                    "MANAGEMENT REPORT AND OPERATIONAL METRICS",
                    "Revenues for FY2024 were $18,562 million, a growth of 1.4% in constant currency.",
                    "Digital revenues accounted for 67.4% of total revenues.",
                    "Operating margin came in at 20.7%, compared to 21.1% in the prior fiscal year.",
                    "Free cash flow generated during the year was $2,882 million, a conversion of 90% of net profit."
                ],
                [
                    "KEY FINANCIAL POSITION & AUDITOR OBSERVATIONS",
                    "Net profit for the year stood at $3,169 million, reflecting resilient performance.",
                    "Total cash and investments totaled $4,580 million with zero long-term debt.",
                    "Auditor Report: Clean unqualified opinion on internal financial controls.",
                    "Voluntary employee attrition reduced significantly to 12.6%."
                ]
            ]
        }
    ]

    # 3. Create PDFs and ingest into vector store
    for seed in seed_data:
        file_path = seed_dir / seed["filename"]
        if not file_path.exists():
            generate_sample_pdf(file_path, seed["company"], seed["year"], seed["pages"])
        
        # Ingest through Document Agent
        document_agent.process_and_index_document(
            file_path=file_path,
            session_id=seed_session_id,
            company_name=seed["company"],
            filing_type="10-K",
            fiscal_year=seed["year"]
        )

if __name__ == "__main__":
    load_seed_documents()
    print("All 4 seed financial documents parsed and indexed successfully.")