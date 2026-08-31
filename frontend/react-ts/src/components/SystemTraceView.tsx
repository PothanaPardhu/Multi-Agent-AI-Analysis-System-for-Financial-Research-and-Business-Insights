import React from 'react';
import { Activity, CheckCircle2, ArrowRight, Cpu, Layers, ShieldCheck, Database, Search, FileText } from 'lucide-react';
import type { AgentTraceStep } from '../types';

export const SystemTraceView: React.FC = () => {
  const agentTraces: AgentTraceStep[] = [
    {
      agent_id: 'A1',
      name: 'Document Ingestion Agent',
      description: 'PDF structural parsing, table preservation, chunking & ChromaDB vector embeddings.',
      status: 'completed',
      output_type: 'Vector Store Chunks (1024 char / 128 overlap)',
      latency: '1.2s avg',
    },
    {
      agent_id: 'A2',
      name: 'Extraction Agent',
      description: 'LLM financial statement extraction (Revenue, Margins, Leverage, EPS) with citation verification.',
      status: 'completed',
      output_type: 'Standardized Structured JSON Metrics',
      latency: '2.4s avg',
    },
    {
      agent_id: 'A3',
      name: 'Red Flag Agent',
      description: 'Forensic audit of Item 1A Risk Factors, contingent liabilities, and supplier concentrations.',
      status: 'completed',
      output_type: 'Risk Catalog with Severity Tags & Primary Quotes',
      latency: '2.1s avg',
    },
    {
      agent_id: 'A4',
      name: 'Comparison & Ranking Agent',
      description: 'Cross-company quantitative scoring, balance sheet health evaluation, and composite ranking.',
      status: 'completed',
      output_type: 'Investment Grades (0-100 Benchmark Matrix)',
      latency: '1.8s avg',
    },
    {
      agent_id: 'A5',
      name: 'Research Agent',
      description: 'Multi-turn conversational grounded query interface with real-time vector retrieval citations.',
      status: 'completed',
      output_type: 'Multi-turn Answer with Page Attributions',
      latency: '1.5s avg',
    },
    {
      agent_id: 'A6',
      name: 'Report Generation Agent',
      description: 'Institutional equity dossier synthesizer aggregating outputs across all agents for PDF export.',
      status: 'completed',
      output_type: 'Full Equity Research PDF Dossier',
      latency: '0.9s avg',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              DAG
            </span>
            <h2 className="text-xl font-bold text-slate-900">Multi-Agent System Execution Trace</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time pipeline orchestration state, inter-agent data flow dependencies, and latency metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>All 6 Agents Operational</span>
        </div>
      </div>

      {/* 2. Pipeline Sequence Flow */}
      <div className="space-y-4">
        {agentTraces.map((trace, idx) => (
          <div
            key={trace.agent_id}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                {trace.agent_id}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{trace.name}</h4>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {trace.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl">{trace.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 self-end md:self-auto text-xs">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Output Artifact</span>
                <span className="font-semibold text-slate-700">{trace.output_type}</span>
              </div>
              <div className="text-right min-w-[60px]">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Latency</span>
                <span className="font-mono font-bold text-indigo-600">{trace.latency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};