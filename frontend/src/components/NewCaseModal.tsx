import React, { useState } from 'react';
import { Plus, X, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { Case, CasePriority, CaseStatus } from '../types';

interface NewCaseModalProps {
  onClose: () => void;
  onCreateCase: (caseData: Partial<Case>) => Promise<void> | void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({ onClose, onCreateCase }) => {
  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [crimeType, setCrimeType] = useState('Theft');
  const [priority, setPriority] = useState<CasePriority>('medium');
  const [status, setStatus] = useState<CaseStatus>('open');
  const [location, setLocation] = useState('Bhopal');
  const [investigator, setInvestigator] = useState('Inspector Sharma');
  const [tagsInput, setTagsInput] = useState('theft, sample');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Frontend validation
    if (!title.trim()) {
      setErrorMsg('Case title is required.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Case location is required.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter((t) => t.length > 0);

    setSubmitting(true);
    try {
      await onCreateCase({
        case_number: caseNumber.trim() || undefined,
        title: title.trim(),
        description: description.trim(),
        crime_type: crimeType,
        priority,
        status,
        location: location.trim(),
        assigned_investigator: investigator.trim() || 'Inspector Sharma',
        tags,
      });

      setSuccessMsg('Case successfully initialized!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg('Failed to initialize case. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-ink-900 border border-ink-700 rounded-lg max-w-lg w-full shadow-2xl">
        <div className="p-4 border-b border-ink-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-tag-amber" />
            <h3 className="font-display font-semibold uppercase tracking-wider text-sm text-text-primary">
              Initialize New Investigation Case
            </h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-mono">
          {errorMsg && (
            <div className="bg-tag-wine/20 border border-tag-wine/40 text-tag-wine p-2.5 rounded flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-tag-moss/20 border border-tag-moss/40 text-tag-moss p-2.5 rounded flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-muted uppercase text-[10px] block mb-1">
                Case Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. CSIA-2026-004"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber"
              />
            </div>
            <div>
              <label className="text-text-muted uppercase text-[10px] block mb-1">
                Case Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Warehouse Theft Incident"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber"
              />
            </div>
          </div>

          <div>
            <label className="text-text-muted uppercase text-[10px] block mb-1">
              Description / Scene Narrative
            </label>
            <textarea
              rows={3}
              placeholder="Incident details, suspect narrative, initial responder report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-text-muted uppercase text-[10px] block mb-1">Crime Type</label>
              <select
                value={crimeType}
                onChange={(e) => setCrimeType(e.target.value)}
                className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber capitalize"
              >
                <option value="Theft">Theft</option>
                <option value="Robbery">Robbery</option>
                <option value="Burglary">Burglary</option>
                <option value="Assault">Assault</option>
                <option value="Homicide">Homicide</option>
                <option value="Fraud">Fraud</option>
              </select>
            </div>

            <div>
              <label className="text-text-muted uppercase text-[10px] block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStatus)}
                className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber capitalize"
              >
                <option value="open">Open</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="cold">Cold</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="text-text-muted uppercase text-[10px] block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as CasePriority)}
                className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber uppercase"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-muted uppercase text-[10px] block mb-1">Location *</label>
              <input
                type="text"
                placeholder="e.g. Bhopal"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber"
              />
            </div>

            <div>
              <label className="text-text-muted uppercase text-[10px] block mb-1">
                Assigned Investigator
              </label>
              <input
                type="text"
                value={investigator}
                onChange={(e) => setInvestigator(e.target.value)}
                className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber"
              />
            </div>
          </div>

          <div>
            <label className="text-text-muted uppercase text-[10px] block mb-1">
              Tags (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. theft, sample, electronics"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-ink-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-ink-800 text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded bg-tag-amber text-ink-950 font-bold hover:bg-tag-amber/90 shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Creating Case...' : 'Initialize Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
