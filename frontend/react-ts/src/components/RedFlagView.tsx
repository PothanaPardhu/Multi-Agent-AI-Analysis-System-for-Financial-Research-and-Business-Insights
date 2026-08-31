import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, AlertOctagon, Info, RefreshCw, Filter, Quote } from 'lucide-react';
import type { RedFlagAlert, Session } from '../types';
import { api } from '../services/api';

interface RedFlagViewProps {
  currentSession: Session | null;
}

export const RedFlagView: React.FC<RedFlagViewProps> = ({ currentSession }) => {
  const [flags, setFlags] = useState<RedFlagAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');

  const fetchRedFlags = async () => {
    if (!currentSession) return;
    setIsLoading(true);
    try {
      const data = await api.getRedFlags(currentSession.session_id);
      setFlags(data);
    } catch (err) {
      console.error('Failed to run red flag risk audit:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentSession) {
      fetchRedFlags();
    }
  }, [currentSession]);

  const severityCounts = {
    CRITICAL: flags.filter((f) => f.severity === 'CRITICAL').length,
    HIGH: flags.filter((f) => f.severity === 'HIGH').length,
    MEDIUM: flags.filter((f) => f.severity === 'MEDIUM').length,
    LOW: flags.filter((f) => f.severity === 'LOW').length,
  };

  const companies = Array.from(new Set(flags.map((f) => f.company_name)));

  const filteredFlags = flags.filter((flag) => {
    const matchesSeverity = selectedSeverity === 'ALL' || flag.severity === selectedSeverity;
    const matchesCompany = selectedCompany === 'ALL' || flag.company_name === selectedCompany;
    return matchesSeverity && matchesCompany;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500 text-white border-rose-600';
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
              A3
            </span>
            <h2 className="text-xl font-bold text-slate-900">Forensic Red Flag & Risk Audit</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated detection of contingent liabilities, regulatory exposures, liquidity risks, and supplier concentrations.
          </p>
        </div>

        <button
          onClick={fetchRedFlags}
          disabled={isLoading || !currentSession}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-rose-600/20 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Auditing Filings...' : 'Run Risk Audit'}</span>
        </button>
      </div>

      {/* 2. Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">Critical Risks</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900 mt-2">{severityCounts.CRITICAL}</div>
        </div>

        <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600">High Risks</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-900 mt-2">{severityCounts.HIGH}</div>
        </div>

        <div className="bg-white border border-amber-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">Medium Risks</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2">{severityCounts.MEDIUM}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Low / Informational</span>
            <Info className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{severityCounts.LOW}</div>
        </div>
      </div>

      {/* 3. Filters Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-card flex flex-wrap items-center justify-between gap-4">
        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Severity:
          </span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedSeverity(lvl)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSeverity === lvl
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Company Filter */}
        {companies.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 mr-2">Company:</span>
            <button
              onClick={() => setSelectedCompany('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCompany === 'ALL'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Companies
            </button>
            {companies.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCompany(c)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCompany === c
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Risk Findings Grid */}
      {isLoading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-card">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rose-600 mb-2" />
          <p className="text-xs font-medium text-slate-500">
            Agent A3 is auditing Item 1A Risk Factors & legal disclosures across filings...
          </p>
        </div>
      ) : filteredFlags.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-card text-slate-400 text-xs">
          No red flags found matching the active criteria. Click "Run Risk Audit" above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFlags.map((flag, idx) => (
            <div
              key={flag.id || idx}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-card flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">{flag.company_name}</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {flag.category}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getSeverityBadge(
                      flag.severity
                    )}`}
                  >
                    {flag.severity}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{flag.risk_title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{flag.observation}</p>
              </div>

              {/* Source Quote Citation */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs text-slate-600 relative">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Quote className="w-3 h-3 text-slate-400" /> Primary Source Quote
                  </span>
                  <span>Page Ref: {flag.page_reference}</span>
                </div>
                <p className="italic text-[11px] text-slate-700">"{flag.citation_quote}"</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};