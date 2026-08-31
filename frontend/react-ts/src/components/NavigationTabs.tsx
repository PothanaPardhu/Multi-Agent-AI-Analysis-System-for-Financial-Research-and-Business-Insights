import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Binary,
  AlertTriangle,
  GitCompare,
  MessagesSquare,
  FileDown,
  Activity
} from 'lucide-react';
import type { TabType } from '../types';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface TabConfig {
  id: TabType;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'documents', label: 'Documents', badge: 'A1', icon: FileText },
  { id: 'extraction', label: 'Extraction', badge: 'A2', icon: Binary },
  { id: 'red_flags', label: 'Red Flags', badge: 'A3', icon: AlertTriangle },
  { id: 'comparison', label: 'Comparison', badge: 'A4', icon: GitCompare },
  { id: 'research', label: 'Research', badge: 'A5', icon: MessagesSquare },
  { id: 'pdf_report', label: 'PDF Report', badge: 'A6', icon: FileDown },
  { id: 'system_trace', label: 'System Trace', icon: Activity },
];

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-5 pb-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                  : 'bg-white/80 text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/80 shadow-xs'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold tracking-tight ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};