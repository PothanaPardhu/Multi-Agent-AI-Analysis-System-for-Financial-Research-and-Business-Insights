import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, BookOpen, Sparkles } from 'lucide-react';
import type { ChatMessage, Session } from '../types';
import { api } from '../services/api';

interface ResearchChatViewProps {
  currentSession: Session | null;
}

export const ResearchChatView: React.FC<ResearchChatViewProps> = ({ currentSession }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: 'Hello! I am your AI Financial Research Analyst. Ask me anything about the indexed 10-K filings, segment revenues, risk exposures, or comparative operational metrics across your companies.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || !currentSession || isLoading) return;

    const userText = inputQuery.trim();
    setInputQuery('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await api.sendResearchQuery(currentSession.session_id, userText);
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: response.citations,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to execute research query:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'An error occurred while analyzing the documents. Please verify that the backend is active and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!currentSession) return;
    try {
      await api.resetResearchHistory(currentSession.session_id);
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: 'assistant',
          text: 'Conversation history reset. What would you like to explore next?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Failed to reset history:', err);
    }
  };

  const samplePrompts = [
    "Compare the Cloud segment growth between Microsoft and its peers.",
    "What are Apple's primary revenue concentration and supply chain risks?",
    "Summarize Tesla's gross margin trajectory and automotive regulatory credits.",
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              A5
            </span>
            <h2 className="text-xl font-bold text-slate-900">Conversational Financial Research Analyst</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grounded multi-turn dialogue with real-time vector retrieval, inline financial citations, and page references.
          </p>
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer self-start md:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset History</span>
        </button>
      </div>

      {/* Main Chat Window */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card flex flex-col h-[650px] overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-3">
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-50 border border-slate-200/70 text-slate-800 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Source Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-700">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Retrieved Source Citations ({msg.citations.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {msg.citations.slice(0, 4).map((c, i) => (
                        <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/60 text-[11px]">
                          <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                            <span>{c.company_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Page {c.page_number}</span>
                          </div>
                          <p className="italic text-slate-500 line-clamp-2">"{c.snippet}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`text-[10px] text-slate-400 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3.5 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Agent A5 is searching vector chunks and synthesizing answer...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-6 py-2 bg-slate-50/60 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Quick Prompts:</span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setInputQuery(prompt)}
              className="text-[11px] bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a financial research question (e.g. 'Compare gross margins and debt ratios between Apple and Microsoft')..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading || !currentSession}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};