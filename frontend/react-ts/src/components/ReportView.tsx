import React, { useState, useEffect } from 'react';
import { Printer, Download, FileText, CheckCircle2, ShieldAlert, Award, RefreshCw, BarChart2 } from 'lucide-react';
import type { ReportDossier, Session } from '../types';
import { api } from '../services/api';

interface ReportViewProps {
  currentSession: Session | null;
}

export const ReportView: React.FC<ReportViewProps> = ({ currentSession }) => {
  const [report, setReport] = useState<ReportDossier | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    if (!currentSession) return;
    setIsLoading(true);
    try {
      const data = await api.getReportDossier(currentSession.session_id);
      setReport(data);
    } catch (err) {
      console.error('Failed to generate report dossier:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentSession) {
      fetchReport();
    }
  }, [currentSession]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      {/* Action Controls - Hidden during Print */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              A6
            </span>
            <h2 className="text-lg font-bold text-slate-900">Institutional Dossier & PDF Export</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated multi-agent synthesis ready for print and distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReport}
            disabled={isLoading || !currentSession}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!report || isLoading}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-card">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
          <p className="text-sm font-semibold text-slate-800">Agent A6 is compiling multi-agent financial dossier...</p>
          <p className="text-xs text-slate-400 mt-1">Aggregating extraction metrics, risk audits, and cohort rankings.</p>
        </div>
      ) : !report ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-xs text-slate-400">
          No report dossier generated yet.
        </div>
      ) : (
        /* Printable Report Container */
        <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-card space-y-8 text-slate-800 print:border-none print:shadow-none print:p-0">
          
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-6 flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Institutional Equity Research
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-3">{report.meta.report_title}</h1>
              <p className="text-xs text-slate-500 mt-1">
                Generated: {report.meta.generated_at} • Workspace: {report.meta.session_id} • System: {report.meta.framework_version}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400">Coverage</span>
              <div className="text-lg font-black text-slate-900">{report.meta.total_companies_covered} Filings Audited</div>
            </div>
          </div>

          {/* Executive Overview */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" /> Section 1: Executive CIO Synthesis
            </h3>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
              {report.executive_summary}
            </div>
          </div>

          {/* Key Findings Callout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/60 border border-emerald-200/60 p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cohort Leader Takeaway
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">{report.leader_takeaway}</p>
            </div>

            <div className="bg-rose-50/60 border border-rose-200/60 p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600" /> Key Structural Risk Exposure
              </div>
              <p className="text-xs text-rose-950 leading-relaxed">{report.high_risk_warning}</p>
            </div>
          </div>

          {/* Comparative Rankings Leaderboard */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-600" /> Section 2: Relative Performance & Investment Grades
            </h3>
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Company</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Grade</th>
                    <th className="py-2.5 px-3">Growth / Margins / Solvency</th>
                    <th className="py-2.5 px-3">Investment Thesis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.rankings.map((r) => (
                    <tr key={r.company_name}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">#{r.rank}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{r.company_name}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{r.composite_score}</td>
                      <td className="py-2.5 px-3 font-extrabold text-[10px]">{r.investment_grade}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                        {r.growth_score} / {r.margin_score} / {r.solvency_score}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{r.key_rationale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Standardized Financial Matrix */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-indigo-600" /> Section 3: Extracted Financial Metrics
            </h3>
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
                    <th className="py-2.5 px-3">Company</th>
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3">Revenue</th>
                    <th className="py-2.5 px-3">YoY Growth</th>
                    <th className="py-2.5 px-3">Net Income</th>
                    <th className="py-2.5 px-3">Gross Margin</th>
                    <th className="py-2.5 px-3">Debt / Equity</th>
                    <th className="py-2.5 px-3">EPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.financial_matrix.map((row) => (
                    <tr key={row.company_name}>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{row.company_name}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono">{row.fiscal_year}</td>
                      <td className="py-2.5 px-3 font-bold font-mono">{row.revenue}</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-600 font-mono">{row.yoy_growth}</td>
                      <td className="py-2.5 px-3 font-mono">{row.net_income}</td>
                      <td className="py-2.5 px-3 font-mono">{row.gross_margin}</td>
                      <td className="py-2.5 px-3 font-mono">{row.debt_to_equity}</td>
                      <td className="py-2.5 px-3 font-mono">{row.eps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Red Flag Audit Findings */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Section 4: Forensic Risk Disclosures & Citations
            </h3>
            <div className="space-y-3">
              {report.red_flags.map((flag, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{flag.company_name} — {flag.risk_title}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      {flag.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{flag.observation}</p>
                  <p className="italic text-[10px] text-slate-500 bg-white p-2 rounded border border-slate-200/50">
                    "{flag.citation_quote}" (Source Page {flag.page_reference})
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-6 text-center text-[10px] text-slate-400">
            Automated Research generated by Multi-Agent Financial Research System (MAFRS) • Confidential Institutional Copy
          </div>

        </div>
      )}
    </div>
  );
};