import React, { useState } from 'react';
import { Search, Folder, MapPin, UserCheck, Tag, Plus, Filter } from 'lucide-react';
import { Case, CasePriority, CaseStatus } from '../types';

interface CaseListProps {
  cases: Case[];
  activeCase: Case | null;
  onSelectCase: (c: Case) => void;
  onOpenNewCase: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export const CaseList: React.FC<CaseListProps> = ({
  cases,
  activeCase,
  onSelectCase,
  onOpenNewCase,
  searchTerm = '',
  onSearchChange
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [crimeTypeFilter, setCrimeTypeFilter] = useState<string>('all');

  const effectiveSearch = onSearchChange ? searchTerm : localSearch;

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      !effectiveSearch ||
      c.title.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      c.case_number.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      c.location.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      c.assigned_investigator.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(effectiveSearch.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
    const matchesCrime = crimeTypeFilter === 'all' || c.crime_type.toLowerCase() === crimeTypeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority && matchesCrime;
  });

  const getPriorityBadge = (priority: CasePriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-tag-wine/20 text-tag-wine border-tag-wine/40';
      case 'high':
        return 'bg-tag-rust/20 text-tag-rust border-tag-rust/40';
      case 'medium':
        return 'bg-tag-amber/20 text-tag-amber border-tag-amber/40';
      case 'low':
        return 'bg-tag-moss/20 text-tag-moss border-tag-moss/40';
    }
  };

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'under_investigation':
        return 'bg-tag-amber/10 text-tag-amber border-tag-amber/30';
      case 'closed':
        return 'bg-tag-moss/10 text-tag-moss border-tag-moss/30';
      case 'cold':
        return 'bg-ink-700 text-text-muted border-ink-600';
      case 'open':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="bg-ink-900 border border-ink-700/80 rounded-lg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-ink-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Folder className="w-4 h-4 text-tag-amber" />
            <h2 className="font-display font-semibold uppercase tracking-wider text-sm text-text-primary">
              Investigations ({cases.length})
            </h2>
          </div>
          <button
            onClick={onOpenNewCase}
            className="text-[11px] font-mono text-tag-amber hover:underline font-semibold"
          >
            + Create
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search number, title, location..."
            value={effectiveSearch}
            onChange={(e) => {
              if (onSearchChange) onSearchChange(e.target.value);
              else setLocalSearch(e.target.value);
            }}
            className="w-full bg-ink-950 border border-ink-700 rounded text-xs pl-8 pr-3 py-1.5 text-text-primary placeholder-text-faint focus:outline-none focus:border-tag-amber font-mono"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-ink-950 border border-ink-700 rounded text-[10px] font-mono px-1.5 py-1 text-text-muted focus:outline-none focus:border-tag-amber"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="under_investigation">Investigating</option>
            <option value="cold">Cold</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-ink-950 border border-ink-700 rounded text-[10px] font-mono px-1.5 py-1 text-text-muted focus:outline-none focus:border-tag-amber"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={crimeTypeFilter}
            onChange={(e) => setCrimeTypeFilter(e.target.value)}
            className="bg-ink-950 border border-ink-700 rounded text-[10px] font-mono px-1.5 py-1 text-text-muted focus:outline-none focus:border-tag-amber capitalize"
          >
            <option value="all">All Types</option>
            <option value="theft">Theft</option>
            <option value="robbery">Robbery</option>
            <option value="burglary">Burglary</option>
            <option value="assault">Assault</option>
          </select>
        </div>
      </div>

      {/* Case List Scrollable Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-ink-800 p-2 space-y-1.5">
        {filteredCases.length === 0 ? (
          <div className="p-6 text-center text-text-muted text-xs font-mono">
            No matching cases found.
          </div>
        ) : (
          filteredCases.map((c) => {
            const isSelected = activeCase?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => onSelectCase(c)}
                className={`p-3 rounded cursor-pointer transition border ${
                  isSelected
                    ? 'bg-ink-800 border-tag-amber/40 shadow-sm'
                    : 'bg-ink-950/60 border-ink-800/80 hover:bg-ink-800/40 hover:border-ink-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px] text-tag-amber font-semibold">
                    {c.case_number}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${getPriorityBadge(
                        c.priority
                      )}`}
                    >
                      {c.priority}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${getStatusBadge(
                        c.status
                      )}`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <h3 className="text-xs font-semibold text-text-primary line-clamp-1 mb-1">
                  {c.title}
                </h3>

                <p className="text-[11px] text-text-muted line-clamp-2 mb-2 font-body leading-relaxed">
                  {c.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-text-faint font-mono pt-1 border-t border-ink-800/80">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-text-muted" />
                    <span className="truncate max-w-[100px]">{c.location}</span>
                  </div>
                  <div>
                    <span className="text-text-primary font-medium">{c.evidence_count ?? c.evidence_items?.length ?? 0}</span>{' '}
                    evidence
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
