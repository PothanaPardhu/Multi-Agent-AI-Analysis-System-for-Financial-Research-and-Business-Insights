import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { DashboardView } from './components/DashboardView';
import { DocumentManager } from './components/DocumentManager';
import type { Session, DocumentMeta, TabType, SessionCreateInput } from './types';
import { api } from './services/api';
import { PlusCircle, X } from 'lucide-react';
import { ExtractionView } from './components/ExtractionView';
import { RedFlagView } from './components/RedFlagView';
import { ComparisonView } from './components/ComparisonView';

export const App: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionDesc, setNewSessionDesc] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load Sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Reload Documents when active session changes
  useEffect(() => {
    if (currentSession) {
      fetchDocuments(currentSession.session_id);
    }
  }, [currentSession]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await api.getSessions();
      setSessions(data);
      if (data.length > 0 && !currentSession) {
        setCurrentSession(data[0]);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async (sessionId: string) => {
    try {
      const docs = await api.getSessionDocuments(sessionId);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load session documents:', err);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle) return;

    try {
      const payload: SessionCreateInput = {
        title: newSessionTitle,
        description: newSessionDesc || undefined,
      };
      const created = await api.createSession(payload);
      setSessions((prev) => [...prev, created]);
      setCurrentSession(created);
      setIsModalOpen(false);
      setNewSessionTitle('');
      setNewSessionDesc('');
    } catch (err) {
      console.error('Failed to create workspace:', err);
    }
  };

  const handleDocumentUploaded = (newDoc: DocumentMeta) => {
    setDocuments((prev) => [...prev, newDoc]);
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        document_count: (currentSession.document_count || 0) + 1,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900 bg-mesh pb-16">
      
      {/* 1. Header with Workspace Switcher */}
      <Header
        currentSession={currentSession}
        sessions={sessions}
        onSelectSession={(session) => setCurrentSession(session)}
        onOpenNewSessionModal={() => setIsModalOpen(true)}
      />

      {/* 2. Top Navigation Tabs */}
      <NavigationTabs activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* 3. Main Views */}
{/* 3. Main Views */}
      <main>
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

        {/* Placeholders for upcoming agent views (Milestones 5-6) */}
        {activeTab !== 'dashboard' &&
          activeTab !== 'documents' &&
          activeTab !== 'extraction' &&
          activeTab !== 'red_flags' &&
          activeTab !== 'comparison' && (
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-card">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                  A{activeTab === 'research' ? '5' : '6'}
                </div>
                <h3 className="text-lg font-bold text-slate-800 capitalize">
                  {activeTab.replace('_', ' ')} Module
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  This agent interface will be activated in the next milestone step.
                </p>
              </div>
            </div>
        )}
      </main>
      {/* New Workspace Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                Create Research Workspace
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. FY24 Semiconductor Benchmark"
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}    
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="e.g. Comparing revenue margins and capital expenditure..."
                  value={newSessionDesc}
                  onChange={(e) => setNewSessionDesc(e.target.value)}
                  rows={3}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSessionTitle}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;