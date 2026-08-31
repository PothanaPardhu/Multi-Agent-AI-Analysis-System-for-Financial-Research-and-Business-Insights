import React from 'react';
import { Layers, Database, Sparkles, Activity } from 'lucide-react';
import type { Session } from '../types';

interface HeaderProps {
  currentSession: Session | null;
  sessions: Session[];
  onSelectSession: (session: Session) => void;
  onOpenNewSessionModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSession,
  sessions,
  onSelectSession,
  onOpenNewSessionModal,
}) => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-indigo-500/20">
            MA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-base">MultiAgent FinIntel.AI</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md border border-slate-200">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Platform Owner: <span className="font-medium text-slate-700">Financial Intelligence Lab</span>
            </p>
          </div>
        </div>

        {/* Center: Active Workspace Selector */}
        <div className="flex items-center bg-slate-50/80 border border-slate-200/80 rounded-full px-4 py-1.5 shadow-xs">
          <Layers className="w-4 h-4 text-indigo-600 mr-2 shrink-0" />
          <span className="text-xs text-slate-500 font-medium mr-1.5">Workspace:</span>
          
          <select
            className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer pr-2"
            value={currentSession?.session_id || ''}
            onChange={(e) => {
              const selected = sessions.find((s) => s.session_id === e.target.value);
              if (selected) onSelectSession(selected);
            }}
          >
            {sessions.map((s) => (
              <option key={s.session_id} value={s.session_id}>
                {s.title}
              </option>
            ))}
          </select>

          <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full ml-1 shrink-0">
            {currentSession?.document_count ?? 0} Filings Indexed
          </span>
          
          <button
            onClick={onOpenNewSessionModal}
            className="ml-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium pl-2 border-l border-slate-200 hover:underline"
          >
            + New
          </button>
        </div>

        {/* Right: Live Status, Vector Store & Profile */}
        <div className="flex items-center gap-3">
          {/* Agent Mesh Status */}
          <div className="flex items-center gap-1.5 bg-emerald-50/60 border border-emerald-200/70 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>6 Agents Active</span>
          </div>

          {/* Engine Tag */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/80 text-slate-700 px-2.5 py-1 rounded-full text-xs font-medium">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>ChromaDB</span>
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              FA
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">Analyst</p>
              <p className="text-[10px] text-slate-500 leading-tight">Lead Research</p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};