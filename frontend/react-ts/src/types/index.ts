// ==========================================
// 1. Session & Workspace Models
// ==========================================
export interface Session {
  session_id: string;
  title: string;
  description?: string;
  created_at: string;
  document_count: number;
}

export interface SessionCreateInput {
  title: string;
  description?: string;
}

// ==========================================
// 2. Document Models
// ==========================================
export interface DocumentMeta {
  document_id: string;
  session_id: string;
  file_name: string;
  company_name: string;
  filing_type: string;
  fiscal_year?: string;
  uploaded_at: string;
  total_pages: number;
  status: 'pending' | 'processing' | 'indexed' | 'failed';
}

// ==========================================
// 3. Extraction Agent Models
// ==========================================
export interface FinancialMetricItem {
  metric_name: string;
  value: string;
  unit: string;
  fiscal_year: string;
  page_reference: number;
  raw_source_snippet: string;
}

export interface CompanyExtractionRow {
  company_name: string;
  fiscal_year: string;
  revenue: string;
  yoy_growth: string;
  net_income: string;
  gross_margin: string;
  debt_to_equity: string;
  eps: string;
  confidence: number;
}

// ==========================================
// 4. Red Flag Agent Models
// ==========================================
export interface RedFlagAlert {
  id?: string;
  company_name: string;
  risk_title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  observation: string;
  page_reference: number;
  citation_quote: string;
}

// ==========================================
// 4.1 Comparison & Ranking Agent Models (A4)
// ==========================================
export interface CompanyRankingItem {
  company_name: string;
  rank: number;
  composite_score: number;
  investment_grade: 'STRONG BUY' | 'BUY' | 'HOLD' | 'UNDERWEIGHT' | 'AVOID';
  growth_score: number;
  margin_score: number;
  solvency_score: number;
  risk_penalty: number;
  key_rationale: string;
}

export interface ComparisonBenchmarkResult {
  rankings: CompanyRankingItem[];
  executive_summary: string;
  leader_takeaway: string;
  high_risk_warning: string;
}

// ==========================================
// 5. Research Agent & Conversational Q&A
// ==========================================
export interface Citation {
  document_id: string;
  company_name: string;
  file_name: string;
  page_number: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agent_name?: string;
  content: string;
  reasoning_steps?: string[];
  citations?: Citation[];
  timestamp: string;
}

// ==========================================
// 6. Navigation Tabs
// ==========================================
export type TabType = 
  | 'dashboard' 
  | 'documents' 
  | 'extraction' 
  | 'red_flags' 
  | 'comparison' 
  | 'research' 
  | 'pdf_report' 
  | 'system_trace';