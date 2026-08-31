import React from 'react';
import { 
  Sparkles, 
  Bot, 
  ArrowUpRight, 
  TrendingUp, 
  PieChart, 
  AlertTriangle, 
  FileText, 
  MessagesSquare, 
  FileDown, 
  Activity,
  CheckCircle2
} from 'lucide-react';
import type { DocumentMeta, TabType } from '../types';

interface DashboardViewProps {
  documents: DocumentMeta[];
  onNavigate: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ documents, onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      
      {/* 1. Hero & Mesh Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Hero Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-card flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100/80 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Multi-Agent Financial Intelligence Platform</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Institutional Forensic &amp; Financial Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2.5 max-w-xl leading-relaxed">
              Six autonomous AI agents collaborate to parse, extract, audit, benchmark, and compile analyst-grade insights from company 10-Ks and annual reports with strict source grounding.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('research')}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <MessagesSquare className="w-4 h-4" />
                <span>Ask Research Agent</span>
              </button>

              <button
                onClick={() => onNavigate('pdf_report')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-slate-500" />
                <span>Generate PDF Audit</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50/80 px-3 py-1.5 rounded-full border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All 6 Agents Synced</span>
            </div>
          </div>
        </div>

        {/* Right Agent Mesh Status Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">Agent Mesh Status</h3>
                  <p className="text-[11px] text-slate-400">Multi-Agent Orchestration Layer</p>
                </div>
              </div>
              <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                100% Health
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Doc &amp; Extraction</span>
                <span className="font-mono text-indigo-600 font-semibold text-[11px]">Gemini 1.5 + Pydantic</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Forensic Scanner</span>
                <span className="font-mono text-rose-600 font-semibold text-[11px]">Red Flag Agent Active</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Vector Grounding</span>
                <span className="font-mono text-emerald-600 font-semibold text-[11px]">0.0% Hallucination Target</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('system_trace')}
            className="w-full mt-6 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>Open System Trace</span>
          </button>
        </div>

      </div>

      {/* 2. Four KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Indexed Filings */}
        <div className="bg-white border-t-4 border-t-indigo-600 border-x border-b border-slate-200/80 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Indexed Filings</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{documents.length} Filings</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Vector Chunked</span>
          </div>
        </div>

        {/* Card 2: Top Growth Leader */}
        <div className="bg-white border-t-4 border-t-emerald-500 border-x border-b border-slate-200/80 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Top Revenue Leader</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-900">Apple Inc.</p>
            <span className="text-xs font-bold text-emerald-600">$383.2B</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">FY2023 Reported Total Revenue</p>
        </div>

        {/* Card 3: Top Gross Margin */}
        <div className="bg-white border-t-4 border-t-amber-500 border-x border-b border-slate-200/80 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Top Gross Margin</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <PieChart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-900">68.9%</p>
            <span className="text-xs font-bold text-slate-500">(MSFT)</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">Followed by Apple (44.1%)</p>
        </div>

        {/* Card 4: Surfaced Red Flags */}
        <div className="bg-white border-t-4 border-t-rose-500 border-x border-b border-slate-200/80 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Surfaced Red Flags</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600">4 Alerts</p>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">1 High Severity Anomaly (Margin compression)</p>
        </div>

      </div>

    </div>
  );
};