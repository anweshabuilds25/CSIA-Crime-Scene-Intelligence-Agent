import React from 'react';
import { Shield, Plus, FileText, Search, User, FolderArchive, Activity } from 'lucide-react';
import { Case } from '../types';

interface NavbarProps {
  cases: Case[];
  activeCase: Case | null;
  onSelectCase: (c: Case) => void;
  onOpenNewCase: () => void;
  onOpenReport: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cases,
  activeCase,
  onSelectCase,
  onOpenNewCase,
  onOpenReport,
  activeTab,
  setActiveTab,
  onQuickSearch
}) => {
  return (
    <header className="bg-ink-900 border-b border-ink-700/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 rounded bg-ink-800 border border-tag-amber/40 flex items-center justify-center text-tag-amber shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display tracking-wider text-lg font-bold text-text-primary">
                  CSIA
                </span>
                <span className="text-[10px] font-mono uppercase bg-tag-amber/20 text-tag-amber px-1.5 py-0.5 rounded border border-tag-amber/30">
                  SECURE // V0.1
                </span>
              </div>
              <p className="text-[10px] text-text-muted hidden sm:block tracking-tight font-mono">
                Crime Scene Intelligence Assistant
              </p>
            </div>
          </div>

          {/* Quick Header Search Bar */}
          <div className="hidden lg:flex items-center relative flex-1 max-w-xs mx-4">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search case, tag, location..."
              onChange={(e) => onQuickSearch(e.target.value)}
              className="w-full bg-ink-950 border border-ink-700 rounded text-xs pl-8 pr-3 py-1.5 text-text-primary placeholder-text-faint focus:outline-none focus:border-tag-amber font-mono"
            />
          </div>

          {/* Active Case Selector */}
          <div className="hidden md:flex items-center space-x-2 bg-ink-800/90 border border-ink-700 px-3 py-1.5 rounded text-sm shrink-0">
            <span className="text-text-muted text-xs font-mono uppercase">Case:</span>
            <select
              value={activeCase?.id || ''}
              onChange={(e) => {
                const found = cases.find((c) => c.id === e.target.value);
                if (found) onSelectCase(found);
              }}
              className="bg-transparent text-text-primary font-mono text-xs font-medium focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id} className="bg-ink-900 text-text-primary">
                  [{c.case_number}] {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Actions & Investigator Profile */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenReport}
              disabled={!activeCase}
              className="flex items-center space-x-1.5 text-xs font-mono bg-ink-800 hover:bg-ink-700 border border-ink-600 text-text-primary px-3 py-1.5 rounded transition disabled:opacity-40"
              title="Generate Case Intelligence Dossier"
            >
              <FileText className="w-3.5 h-3.5 text-tag-amber" />
              <span className="hidden sm:inline">Dossier Report</span>
            </button>

            <button
              onClick={onOpenNewCase}
              className="flex items-center space-x-1.5 text-xs font-mono bg-tag-amber text-ink-950 hover:bg-tag-amber/90 font-semibold px-3 py-1.5 rounded transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Case</span>
            </button>

            {/* Profile Avatar / Investigator Badge */}
            <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-ink-800 text-xs font-mono text-text-muted">
              <div className="w-7 h-7 rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center text-text-primary">
                <User className="w-3.5 h-3.5 text-tag-moss" />
              </div>
              <span className="hidden xl:inline text-text-primary text-[11px] font-mono">
                {activeCase?.assigned_investigator || 'Inspector Sharma'}
              </span>
            </div>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        {activeCase && (
          <div className="flex space-x-1 overflow-x-auto border-t border-ink-800 py-1 scrollbar-none">
            {[
              { id: 'overview', label: 'Dashboard Overview' },
              { id: 'evidence', label: `Evidence Locker (${activeCase.evidence_items.length})` },
              { id: 'timeline', label: 'Timeline' },
              { id: 'next_steps', label: 'Next Steps' },
              { id: 'nlp_graph', label: 'NLP & Relations' },
              { id: 'image_scanner', label: 'Image Analysis' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-mono rounded transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-ink-800 text-tag-amber border border-tag-amber/30 font-semibold shadow-inner'
                    : 'text-text-muted hover:text-text-primary hover:bg-ink-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
