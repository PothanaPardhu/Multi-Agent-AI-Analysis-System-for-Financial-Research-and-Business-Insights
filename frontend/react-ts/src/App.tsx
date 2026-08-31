import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Files, 
  Table, 
  AlertTriangle, 
  GitCompare, 
  MessageSquare, 
  FileText, 
  Activity, 
  Plus, 
  FolderKanban,
  CheckCircle2,
  Database
} from 'lucide-react';
import type { Session, DocumentMeta, TabType } from './types';
import { api } from './services/api';

import { DashboardView } from './components/DashboardView';
import { DocumentManager } from './components/DocumentManager';
import { ExtractionView } from './components/ExtractionView';
import { RedFlagView } from './components/RedFlagView';
import { ComparisonView } from './components/ComparisonView';
import { ResearchChatView } from './components/ResearchChatView';
import { ReportView } from './components/ReportView';
import { SystemTraceView } from './components/SystemTraceView';

export const App: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
      if (data.length > 0 && !currentSession) {
        setCurrentSession(data[0]);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const loadDocuments = async (sessionId: string) => {
    try {
      const docs = await api.getSessionDocuments(sessionId);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (currentSession) {
      loadDocuments(currentSession.session_id);
    }
  }, [currentSession]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim()) return;
    try {
      const newSession = await api.createSession({ title: newSessionTitle.trim() });
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setNewSessionTitle('');
      setIsCreatingSession(false);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleDocumentUploaded = (newDoc: DocumentMeta) => {
    setDocuments((prev) => [newDoc, ...prev]);
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        document_count: (currentSession.document_count || 0) + 1,
      });
    }
  };

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'documents', label: 'Documents', badge: 'A1', icon: Files },
    { id: 'extraction', label: 'Extraction', badge: 'A2', icon: Table },
    { id: 'red_flags', label: 'Red Flags', badge: 'A3', icon: AlertTriangle },
    { id: 'comparison', label: 'Comparison', badge: 'A4', icon: GitCompare },
    { id: 'research', label: 'Research', badge: 'A5', icon: MessageSquare },
    { id: 'pdf_report', label: 'PDF Report', badge: 'A6', icon: FileText },
    { id: 'system_trace', label: 'System Trace', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Top Global Navigation Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-subtle print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/20">
              MA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-sm">
                  MultiAgent FinIntel.AI
                </span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                  v2.0
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                Institutional Financial Research & Forensic Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={currentSession?.session_id || ''}
                onChange={(e) => {
                  const sel = sessions.find((s) => s.session_id === e.target.value);
                  if (sel) setCurrentSession(sel);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer pr-8"
              >
                {sessions.map((s) => (
                  <option key={s.session_id} value={s.session_id}>
                    {s.title} ({s.document_count || 0} Docs)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsCreatingSession(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-6 flex space-x-1 overflow-x-auto no-scrollbar">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. Create Workspace Modal */}
      {isCreatingSession && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Create New Research Workspace</h3>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <input
                type="text"
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
                placeholder="e.g. Q4 MegaCap Cloud Comparison"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingSession(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSessionTitle.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Main Views */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <DashboardView documents={documents} onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'documents' && (
          <DocumentManager
            currentSession={currentSession}
            documents={documents}
            onDocumentUploaded={handleDocumentUploaded}
          />
        )}

        {activeTab === 'extraction' && (
          <ExtractionView currentSession={currentSession} />
        )}

        {activeTab === 'red_flags' && (
          <RedFlagView currentSession={currentSession} />
        )}

        {activeTab === 'comparison' && (
          <ComparisonView currentSession={currentSession} />
        )}

        {activeTab === 'research' && (
          <ResearchChatView currentSession={currentSession} />
        )}

        {activeTab === 'pdf_report' && (
          <ReportView currentSession={currentSession} />
        )}

        {activeTab === 'system_trace' && (
          <SystemTraceView />
        )}
      </main>
    </div>
  );
};

export default App;