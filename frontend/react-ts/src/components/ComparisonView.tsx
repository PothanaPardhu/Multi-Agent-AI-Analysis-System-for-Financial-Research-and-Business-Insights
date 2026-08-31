import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp, AlertTriangle, RefreshCw, BarChart3, ShieldCheck } from 'lucide-react';
import type { ComparisonBenchmarkResult, Session } from '../types';
import { api } from '../services/api';

interface ComparisonViewProps {
  currentSession: Session | null;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ currentSession }) => {
  const [data, setData] = useState<ComparisonBenchmarkResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchComparison = async () => {
    if (!currentSession) return;
    setIsLoading(true);
    try {
      const res = await api.getComparisonBenchmark(currentSession.session_id);
      setData(res);
    } catch (err) {
      console.error('Failed to run comparison agent:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentSession) {
      fetchComparison();
    }
  }, [currentSession]);

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'STRONG BUY':
        return 'bg-emerald-600 text-white';
      case 'BUY':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'HOLD':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'UNDERWEIGHT':
        return 'bg-rose-100 text-rose-800 border border-rose-300';
      case 'AVOID':
        return 'bg-rose-600 text-white';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              A4
            </span>
            <h2 className="text-xl font-bold text-slate-900">Cross-Company Ranking & Peer Benchmark</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated multi-factor evaluation scoring growth, profitability margins, solvency, and risk exposure penalties.
          </p>
        </div>

        <button
          onClick={fetchComparison}
          disabled={isLoading || !currentSession}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Ranking Entities...' : 'Run Benchmark Ranking'}</span>
        </button>
      </div>

      {/* 2. Executive Synthesis Highlights */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-card md:col-span-2 space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              <span>CIO Executive Takeaway</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{data.executive_summary}</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-card space-y-2">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Risk & Volatility Flag</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{data.high_risk_warning}</p>
          </div>
        </div>
      )}

      {/* 3. Comparative Leaderboard Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Cross-Sectional Leaderboard</h3>
            <p className="text-xs text-slate-500">
              Composite weighted score across growth rate, margins, leverage ratio, and forensic risk penalties.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Rank</th>
                <th className="pb-3">Company</th>
                <th className="pb-3">Composite Score</th>
                <th className="pb-3">Investment Grade</th>
                <th className="pb-3">Growth</th>
                <th className="pb-3">Margins</th>
                <th className="pb-3">Solvency</th>
                <th className="pb-3">Risk Penalty</th>
                <th className="pb-3 pr-2">Thesis Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    <span>Agent A4 is calculating multi-factor weights and generating benchmark scores...</span>
                  </td>
                </tr>
              ) : !data || data.rankings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No comparison data available. Click "Run Benchmark Ranking" above.
                  </td>
                </tr>
              ) : (
                data.rankings.map((item) => (
                  <tr key={item.company_name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pl-2 font-black text-slate-900 text-sm">
                      <span className="flex items-center gap-1.5">
                        {item.rank === 1 && <Trophy className="w-4 h-4 text-amber-500" />}
                        #{item.rank}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-slate-900">
                      {item.company_name}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-indigo-600 font-mono text-sm">
                          {item.composite_score}
                        </span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${Math.min(item.composite_score, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${getGradeBadge(item.investment_grade)}`}>
                        {item.investment_grade}
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-slate-700">{item.growth_score}</td>
                    <td className="py-3.5 font-semibold text-slate-700">{item.margin_score}</td>
                    <td className="py-3.5 font-semibold text-slate-700">{item.solvency_score}</td>
                    <td className="py-3.5">
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        -{item.risk_penalty} pts
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-xs text-slate-600 max-w-xs">
                      {item.key_rationale}
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