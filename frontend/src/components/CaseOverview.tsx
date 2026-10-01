import React, { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  UserCheck,
  Tag,
  Clock,
  Layers,
  Sparkles,
  GitBranch,
  Edit2,
  Check,
  X,
  PlusCircle,
  FolderOpen,
  Scan,
  AlertCircle
} from 'lucide-react';
import { Case, CasePriority, CaseStatus } from '../types';

interface CaseOverviewProps {
  currentCase: Case;
  totalCasesCount: number;
  openCasesCount: number;
  highPriorityCount: number;
  totalEvidenceCount: number;
  onUpdateCase: (updated: Partial<Case>) => void;
  onNavigateTab: (tab: string) => void;
  onOpenNewCase: () => void;
}

export const CaseOverview: React.FC<CaseOverviewProps> = ({
  currentCase,
  totalCasesCount,
  openCasesCount,
  highPriorityCount,
  totalEvidenceCount,
  onUpdateCase,
  onNavigateTab,
  onOpenNewCase
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(currentCase.title);
  const [description, setDescription] = useState(currentCase.description);
  const [location, setLocation] = useState(currentCase.location);
  const [investigator, setInvestigator] = useState(currentCase.assigned_investigator);
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    onUpdateCase({
      title,
      description,
      location,
      assigned_investigator: investigator,
    });
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const tagClean = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (!currentCase.tags.includes(tagClean)) {
      onUpdateCase({ tags: [...currentCase.tags, tagClean] });
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateCase({
      tags: currentCase.tags.filter((t) => t !== tagToRemove),
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Overview Metric Cards (Directly derived from frontend dataset) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-ink-900 border border-ink-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted font-mono text-[11px] uppercase">
            <span>Total Cases</span>
            <FolderOpen className="w-3.5 h-3.5 text-tag-amber" />
          </div>
          <div className="text-2xl font-bold font-display text-text-primary mt-1">
            {totalCasesCount}
          </div>
          <div className="text-[10px] text-text-faint font-mono">Managed investigations</div>
        </div>

        <div className="bg-ink-900 border border-ink-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted font-mono text-[11px] uppercase">
            <span>Open Cases</span>
            <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-display text-blue-400 mt-1">
            {openCasesCount}
          </div>
          <div className="text-[10px] text-text-faint font-mono">Active status cases</div>
        </div>

        <div className="bg-ink-900 border border-ink-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted font-mono text-[11px] uppercase">
            <span>High/Critical</span>
            <ShieldAlert className="w-3.5 h-3.5 text-tag-rust" />
          </div>
          <div className="text-2xl font-bold font-display text-tag-rust mt-1">
            {highPriorityCount}
          </div>
          <div className="text-[10px] text-text-faint font-mono">Priority triage count</div>
        </div>

        <div className="bg-ink-900 border border-ink-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted font-mono text-[11px] uppercase">
            <span>Evidence Items</span>
            <Layers className="w-3.5 h-3.5 text-tag-moss" />
          </div>
          <div className="text-2xl font-bold font-display text-tag-moss mt-1">
            {totalEvidenceCount}
          </div>
          <div className="text-[10px] text-text-faint font-mono">Registered artifacts</div>
        </div>
      </div>

      {/* 2. Quick Actions Panel */}
      <div className="bg-ink-900 border border-ink-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <span className="text-text-muted uppercase text-[10px] font-bold">Quick Actions:</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewCase}
            className="flex items-center space-x-1.5 bg-ink-800 hover:bg-ink-700 border border-ink-700 text-text-primary px-3 py-1.5 rounded transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-tag-amber" />
            <span>Create Case</span>
          </button>
          <button
            onClick={() => onNavigateTab('evidence')}
            className="flex items-center space-x-1.5 bg-ink-800 hover:bg-ink-700 border border-ink-700 text-text-primary px-3 py-1.5 rounded transition"
          >
            <Layers className="w-3.5 h-3.5 text-tag-moss" />
            <span>Add Evidence</span>
          </button>
          <button
            onClick={() => onNavigateTab('image_scanner')}
            className="flex items-center space-x-1.5 bg-ink-800 hover:bg-ink-700 border border-ink-700 text-text-primary px-3 py-1.5 rounded transition"
          >
            <Scan className="w-3.5 h-3.5 text-blue-400" />
            <span>Analyze Evidence</span>
          </button>
          <button
            onClick={() => onNavigateTab('nlp_graph')}
            className="flex items-center space-x-1.5 bg-ink-800 hover:bg-ink-700 border border-ink-700 text-text-primary px-3 py-1.5 rounded transition"
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-400" />
            <span>Analyze Statement</span>
          </button>
        </div>
      </div>

      {/* 3. Active Case Detail Card */}
      <div className="bg-ink-900 border border-ink-700/80 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-ink-800">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="font-mono text-xs bg-tag-amber/15 text-tag-amber font-bold px-2 py-0.5 rounded border border-tag-amber/30">
                CASE {currentCase.case_number}
              </span>
              <span className="text-text-muted text-xs font-mono">
                Location: {currentCase.location}
              </span>
            </div>

            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-ink-950 border border-tag-amber text-lg font-bold text-text-primary px-3 py-1 rounded font-display"
              />
            ) : (
              <h1 className="text-xl md:text-2xl font-bold font-display tracking-wide text-text-primary">
                {currentCase.title}
              </h1>
            )}
          </div>

          {/* Quick Status and Priority Switchers */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 bg-ink-950 border border-ink-700 px-2.5 py-1 rounded">
              <span className="text-[11px] font-mono text-text-muted uppercase">Status:</span>
              <select
                value={currentCase.status}
                onChange={(e) => onUpdateCase({ status: e.target.value as CaseStatus })}
                className="bg-transparent text-xs font-mono text-tag-amber focus:outline-none cursor-pointer uppercase font-semibold"
              >
                <option value="open" className="bg-ink-900">Open</option>
                <option value="under_investigation" className="bg-ink-900">Under Investigation</option>
                <option value="cold" className="bg-ink-900">Cold</option>
                <option value="closed" className="bg-ink-900">Closed</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-ink-950 border border-ink-700 px-2.5 py-1 rounded">
              <span className="text-[11px] font-mono text-text-muted uppercase">Priority:</span>
              <select
                value={currentCase.priority}
                onChange={(e) => onUpdateCase({ priority: e.target.value as CasePriority })}
                className="bg-transparent text-xs font-mono text-text-primary focus:outline-none cursor-pointer uppercase font-semibold"
              >
                <option value="critical" className="bg-ink-900 text-tag-wine">Critical</option>
                <option value="high" className="bg-ink-900 text-tag-rust">High</option>
                <option value="medium" className="bg-ink-900 text-tag-amber">Medium</option>
                <option value="low" className="bg-ink-900 text-tag-moss">Low</option>
              </select>
            </div>

            {isEditing ? (
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleSave}
                  className="bg-tag-amber text-ink-950 px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-ink-800 text-text-muted px-2.5 py-1 rounded text-xs font-mono flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-ink-800 hover:bg-ink-700 border border-ink-700 text-text-muted hover:text-text-primary px-2.5 py-1 rounded text-xs font-mono flex items-center space-x-1 transition"
              >
                <Edit2 className="w-3 h-3 text-tag-amber" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>

        {/* Description & Incident Details */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-1.5">
                Incident Description & Scene Context
              </h3>
              {isEditing ? (
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-ink-950 border border-tag-amber rounded p-2.5 text-xs text-text-primary font-mono focus:outline-none"
                />
              ) : (
                <p className="text-sm text-text-primary/90 leading-relaxed font-body bg-ink-950/50 p-3 rounded border border-ink-800">
                  {currentCase.description || 'No description entered yet.'}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-text-muted uppercase tracking-wider flex items-center space-x-1">
                  <Tag className="w-3 h-3 text-tag-amber" />
                  <span>Case Tags</span>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {currentCase.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 text-xs font-mono bg-ink-800 text-tag-amber px-2 py-0.5 rounded border border-ink-700"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-tag-wine transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <div className="inline-flex items-center space-x-1 bg-ink-950 border border-ink-700 rounded px-2 py-0.5">
                  <input
                    type="text"
                    placeholder="add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    className="bg-transparent text-xs text-text-primary font-mono w-20 focus:outline-none"
                  />
                  <button onClick={handleAddTag} className="text-text-muted hover:text-tag-amber">
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Meta Side Column */}
          <div className="bg-ink-950/70 border border-ink-800 rounded p-4 space-y-3 font-mono text-xs">
            <div>
              <span className="text-text-faint uppercase text-[10px] block">Location</span>
              {isEditing ? (
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-ink-900 border border-ink-700 px-2 py-1 rounded text-text-primary text-xs mt-1"
                />
              ) : (
                <div className="flex items-center space-x-1.5 text-text-primary mt-0.5 font-sans font-medium">
                  <MapPin className="w-3.5 h-3.5 text-tag-amber" />
                  <span>{currentCase.location}</span>
                </div>
              )}
            </div>

            <div>
              <span className="text-text-faint uppercase text-[10px] block">Crime Classification</span>
              <div className="text-text-primary uppercase tracking-wide font-semibold mt-0.5">
                {currentCase.crime_type}
              </div>
            </div>

            <div>
              <span className="text-text-faint uppercase text-[10px] block">Lead Investigator</span>
              {isEditing ? (
                <input
                  type="text"
                  value={investigator}
                  onChange={(e) => setInvestigator(e.target.value)}
                  className="w-full bg-ink-900 border border-ink-700 px-2 py-1 rounded text-text-primary text-xs mt-1"
                />
              ) : (
                <div className="flex items-center space-x-1.5 text-text-primary mt-0.5 font-sans">
                  <UserCheck className="w-3.5 h-3.5 text-tag-moss" />
                  <span>{currentCase.assigned_investigator}</span>
                </div>
              )}
            </div>

            <div>
              <span className="text-text-faint uppercase text-[10px] block">Last Updated</span>
              <div className="text-text-muted mt-0.5">
                {new Date(currentCase.updated_at || currentCase.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Investigation Workflows Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Evidence Locker Card */}
        <div
          onClick={() => onNavigateTab('evidence')}
          className="bg-ink-900 border border-ink-700/80 hover:border-tag-amber/50 rounded-lg p-4 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-text-muted">Evidence Locker</span>
            <Layers className="w-4 h-4 text-tag-amber group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold font-display text-text-primary">
            {currentCase.evidence_items.length} Artifact{currentCase.evidence_items.length === 1 ? '' : 's'}
          </div>
          <p className="text-[11px] text-text-faint font-mono mt-1">
            Registered chain of custody exhibits
          </p>
        </div>

        {/* Timeline Reconstruction Card */}
        <div
          onClick={() => onNavigateTab('timeline')}
          className="bg-ink-900 border border-ink-700/80 hover:border-tag-amber/50 rounded-lg p-4 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-text-muted">Investigation Timeline</span>
            <Clock className="w-4 h-4 text-tag-amber group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold font-display text-text-primary">
            {currentCase.evidence_items.length > 0 ? `${currentCase.evidence_items.length} Event Sequence` : 'Empty'}
          </div>
          <p className="text-[11px] text-text-faint font-mono mt-1">
            Chronological reconstruction log
          </p>
        </div>

        {/* Next Steps Card */}
        <div
          onClick={() => onNavigateTab('next_steps')}
          className="bg-ink-900 border border-ink-700/80 hover:border-tag-amber/50 rounded-lg p-4 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-text-muted">Next-Step Suggestions</span>
            <Sparkles className="w-4 h-4 text-tag-amber group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold font-display text-text-primary">
            Recommendations
          </div>
          <p className="text-[11px] text-text-faint font-mono mt-1">
            Investigation next-step advisory
          </p>
        </div>

        {/* NLP & Graph Card */}
        <div
          onClick={() => onNavigateTab('nlp_graph')}
          className="bg-ink-900 border border-ink-700/80 hover:border-tag-amber/50 rounded-lg p-4 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-text-muted">NLP & Relations</span>
            <GitBranch className="w-4 h-4 text-tag-amber group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold font-display text-text-primary">
            Entity Links
          </div>
          <p className="text-[11px] text-text-faint font-mono mt-1">
            Witness, suspect & location chains
          </p>
        </div>
      </div>
    </div>
  );
};
