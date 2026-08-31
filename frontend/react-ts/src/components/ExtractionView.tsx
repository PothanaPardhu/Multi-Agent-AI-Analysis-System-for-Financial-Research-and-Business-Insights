import React, { useState, useEffect } from 'react';
import { Binary, RefreshCw, CheckCircle2, TrendingUp, DollarSign, ShieldAlert, Sparkles } from 'lucide-react';
import type { CompanyExtractionRow, Session } from '../types';
import { api } from '../services/api';

interface ExtractionViewProps {
  currentSession: Session | null;
}

export const ExtractionView: React.FC<ExtractionViewProps> = ({ currentSession }) => {
  const [matrix, setMatrix] = useState<CompanyExtractionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchMatrix = async () => {
    if (!currentSession) return;
    setIsLoading(true);
    try {
      const data = await api.getExtractionMatrix(currentSession.session_id);
      setMatrix(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to run financial extraction:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentSession) {
      fetchMatrix();
    }
  }, [currentSession]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              A2
            </span>
            <h2 className="text-xl font-bold text-slate-900">Financial Metric Extraction Matrix</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Autonomous multi-filing metric extraction with cross-sectional verification and strict schema conformance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px] text-slate-400 font-medium">
              Last synced: {lastUpdated}
            </span>
          )}
          <button
            onClick={fetchMatrix}
            disabled={isLoading || !currentSession}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Extracting Metrics...' : 'Run Extraction Agent'}</span>
          </button>
        </div>
      </div>

      {/* 2. Extraction Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Standardized Financial Metrics</h3>
            <p className="text-xs text-slate-500">
              Normalized balance sheet and income statement datapoints from indexed 10-K filings.
            </p>
          </div>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pydantic Validated</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Company</th>
                <th className="pb-3">Period</th>
                <th className="pb-3">Revenue</th>
                <th className="pb-3">YoY Growth</th>
                <th className="pb-3">Net Income</th>
                <th className="pb-3">Gross Margin</th>
                <th className="pb-3">Debt / Equity</th>
                <th className="pb-3">Diluted EPS</th>
                <th className="pb-3 pr-2 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    <span>Agent A2 is parsing vector chunks and extracting metrics...</span>
                  </td>
                </tr>
              ) : matrix.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No extraction records found. Click "Run Extraction Agent" above.
                  </td>
                </tr>
              ) : (
                matrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pl-2 font-bold text-slate-900">
                      {row.company_name}
                    </td>
                    <td className="py-3.5 font-mono text-slate-600 text-[11px]">
                      {row.fiscal_year}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-900">
                      {row.revenue}
                    </td>
                    <td className="py-3.5 font-medium">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          row.yoy_growth.startsWith('-')
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {row.yoy_growth}
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-slate-900">
                      {row.net_income}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-900">
                      {row.gross_margin}
                    </td>
                    <td className="py-3.5 font-mono text-slate-600">
                      {row.debt_to_equity}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-900">
                      {row.eps}
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                        {row.confidence}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};