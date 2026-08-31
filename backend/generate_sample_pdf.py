from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import os

def generate_nvidia_10k_pdf(output_path="NVIDIA_FY2024_10K_Excerpt.pdf"):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569'),
        spaceAfter=14
    )
    
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=12,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )

    bold_callout = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0f172a'),
        fontName='Helvetica-Bold',
        spaceAfter=4
    )

    story = []

    # --- Header Banner ---
    story.append(Paragraph("UNITED STATES SECURITIES AND EXCHANGE COMMISSION", subtitle_style))
    story.append(Paragraph("FORM 10-K — ANNUAL REPORT", title_style))
    story.append(Paragraph("<b>NVIDIA CORPORATION</b> | Fiscal Year Ended January 28, 2024 | Commission File No. 000-23985", subtitle_style))
    story.append(Spacer(1, 10))

    # --- Section: Item 7 MD&A ---
    story.append(Paragraph("ITEM 7. MANAGEMENT'S DISCUSSION AND ANALYSIS OF FINANCIAL CONDITION", h2_style))
    story.append(Paragraph(
        "NVIDIA Corporation is the pioneer of GPU-accelerated computing and full-stack accelerated computing platforms. "
        "For fiscal year 2024 (FY2024), total revenue was $60,922 million, up 126% from $26,974 million in fiscal year 2023. "
        "Gross margin expanded significantly to 72.7% compared to 56.9% in the prior fiscal year, driven primarily by strong growth in Data Center platforms. "
        "Net income for fiscal year 2024 was $29,760 million, representing diluted earnings per share (EPS) of $11.93, compared to $4,368 million or $1.74 diluted EPS in fiscal year 2023.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # --- Financial Performance Table ---
    story.append(Paragraph("<b>Consolidated Statements of Income & Financial Metrics Summary</b>", bold_callout))
    
    table_data = [
        ["Financial Metric", "FY2024 ($ in Millions)", "FY2023 ($ in Millions)", "YoY Growth (%)"],
        ["Total Revenue", "$60,922", "$26,974", "+125.9%"],
        ["Data Center Segment Revenue", "$47,525", "$15,005", "+216.7%"],
        ["Gaming Segment Revenue", "$10,447", "$9,067", "+15.2%"],
        ["Professional Visualization", "$1,553", "$1,544", "+0.6%"],
        ["Automotive Segment", "$1,091", "$903", "+20.8%"],
        ["Gross Profit", "$44,301", "$15,356", "+188.5%"],
        ["Gross Margin %", "72.7%", "56.9%", "+1,580 bps"],
        ["Operating Income", "$32,972", "$4,224", "+680.6%"],
        ["Net Income", "$29,760", "$4,368", "+581.3%"],
        ["Diluted EPS ($)", "$11.93", "$1.74", "+585.6%"],
        ["Total Debt / Equity Ratio", "0.25", "0.51", "-51.0%"]
    ]

    t = Table(table_data, colWidths=[200, 110, 110, 110])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 5),
        ('TOPPADDING', (0, 0), (-1, 0), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f1f5f9')]),
    ]))
    story.append(t)
    story.append(Spacer(1, 14))

    # --- Balance Sheet & Solvency ---
    story.append(Paragraph("<b>Balance Sheet, Solvency & Liquidity Profile</b>", bold_callout))
    story.append(Paragraph(
        "As of January 28, 2024, NVIDIA held $25,984 million in cash, cash equivalents, and marketable securities, compared to $13,296 million as of January 29, 2023. "
        "Total principal long-term debt was $8,460 million, resulting in a conservative Debt-to-Equity ratio of 0.25. "
        "Free cash flow generated during FY2024 surged to $26,947 million, up from $3,808 million in FY2023, reflecting strong operating leverage and disciplined working capital management.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # --- Section: Item 1A Risk Factors ---
    story.append(PageBreak()) # Clean page for forensic red flags
    story.append(Paragraph("ITEM 1A. RISK FACTORS & CONTINGENT LIABILITIES", h2_style))
    story.append(Paragraph(
        "The following risk factors could materially affect our business, financial condition, operating results, and stock valuation:",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Risk 1
    story.append(Paragraph("<b>1. Extreme Supply Chain Concentration and Foundry Dependency (CRITICAL)</b>", bold_callout))
    story.append(Paragraph(
        "We rely on a single independent foundry, Taiwan Semiconductor Manufacturing Company (TSMC), to manufacture our cutting-edge Hopper and Blackwell architecture GPUs. "
        "Any geopolitical conflict, natural catastrophe, or production bottleneck in Taiwan would disrupt our ability to meet hyperscaler customer demand and cause severe revenue impairment.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Risk 2
    story.append(Paragraph("<b>2. Export Controls, Geopolitical Restrictions & China Revenue Impairment (HIGH)</b>", bold_callout))
    story.append(Paragraph(
        "United States Department of Commerce Bureau of Industry and Security (BIS) export regulations restrict deliveries of advanced AI accelerators (such as A100, H100, and customized variants) to China and certain Middle Eastern markets. "
        "Historical China data center revenue accounted for approximately 20% to 25% of segment sales. Regulatory escalation could permanently degrade addressable market opportunities.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Risk 3
    story.append(Paragraph("<b>3. Hyperscaler Customer Revenue Concentration (MEDIUM)</b>", bold_callout))
    story.append(Paragraph(
        "During fiscal year 2024, sales to Customer A and Customer B (major cloud service providers) accounted for approximately 19% and 15% of total consolidated revenue, respectively. "
        "The loss of or substantial reduction in capital expenditure from either customer could materially impact operating results.",
        body_style
    ))

    doc.build(story)
    print(f"[✓] Generated 10-K filing excerpt: {os.path.abspath(output_path)}")

if __name__ == "__main__":
    generate_nvidia_10k_pdf()