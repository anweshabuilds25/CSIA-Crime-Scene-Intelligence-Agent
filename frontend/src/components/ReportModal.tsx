import React from 'react';
import { FileText, Printer, Download, X, Shield, Clock, CheckCircle2 } from 'lucide-react';
import { Case } from '../types';

interface ReportModalProps {
  currentCase: Case;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ currentCase, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentCase, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentCase.case_number}_dossier.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-ink-900 border border-ink-700 rounded-lg max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-ink-800 flex items-center justify-between bg-ink-900 sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-tag-amber" />
            <h3 className="font-display font-semibold uppercase tracking-wider text-sm text-text-primary">
              Case Intelligence Dossier & Report // {currentCase.case_number}
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-ink-800 hover:bg-ink-700 border border-ink-600 text-text-primary px-3 py-1.5 rounded text-xs font-mono transition"
            >
              <Printer className="w-3.5 h-3.5 text-tag-amber" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center space-x-1.5 bg-ink-800 hover:bg-ink-700 border border-ink-600 text-text-primary px-3 py-1.5 rounded text-xs font-mono transition"
            >
              <Download className="w-3.5 h-3.5 text-tag-moss" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary ml-2 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 font-body text-text-primary bg-ink-950/60 print:bg-white print:text-black">
          {/* Header Banner */}
          <div className="border-b-2 border-tag-amber pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-tag-amber" />
                <h1 className="font-display tracking-widest text-2xl font-bold text-text-primary uppercase print:text-black">
                  CRIME SCENE INTELLIGENCE ASSISTANT
                </h1>
              </div>
              <p className="text-xs text-text-muted font-mono mt-1 print:text-gray-600">
                Official Case Investigative Dossier & Evidence Log
              </p>
            </div>
            <div className="text-right font-mono text-xs text-text-muted print:text-gray-600">
              <div className="text-tag-amber font-bold print:text-black">CASE ID: {currentCase.case_number}</div>
              <div>LOCATION: {currentCase.location}</div>
            </div>
          </div>

          {/* Section 1: Overview */}
          <div className="bg-ink-900 border border-ink-800 rounded-lg p-5 space-y-3 print:bg-gray-50 print:border-gray-300">
            <h2 className="text-xs font-mono uppercase text-tag-amber font-bold tracking-wider">
              1. Case Overview & Incident Parameters
            </h2>
            <div className="text-lg font-bold text-text-primary print:text-black font-display">
              {currentCase.title}
            </div>
            <p className="text-xs text-text-muted print:text-gray-700 leading-relaxed">
              {currentCase.description}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
              <div className="bg-ink-950 p-2 rounded border border-ink-800 print:bg-white print:border-gray-200">
                <span className="text-[10px] text-text-faint uppercase block">Status</span>
                <span className="font-bold uppercase text-tag-amber print:text-black">{currentCase.status}</span>
              </div>
              <div className="bg-ink-950 p-2 rounded border border-ink-800 print:bg-white print:border-gray-200">
                <span className="text-[10px] text-text-faint uppercase block">Priority</span>
                <span className="font-bold uppercase text-text-primary print:text-black">{currentCase.priority}</span>
              </div>
              <div className="bg-ink-950 p-2 rounded border border-ink-800 print:bg-white print:border-gray-200">
                <span className="text-[10px] text-text-faint uppercase block">Crime Classification</span>
                <span className="font-bold uppercase text-text-primary print:text-black">{currentCase.crime_type}</span>
              </div>
              <div className="bg-ink-950 p-2 rounded border border-ink-800 print:bg-white print:border-gray-200">
                <span className="text-[10px] text-text-faint uppercase block">Investigator</span>
                <span className="font-bold text-text-primary print:text-black">{currentCase.assigned_investigator}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Evidence Register */}
          <div className="bg-ink-900 border border-ink-800 rounded-lg p-5 space-y-3 print:bg-gray-50 print:border-gray-300">
            <h2 className="text-xs font-mono uppercase text-tag-amber font-bold tracking-wider">
              2. Registered Evidence Items ({currentCase.evidence_items.length})
            </h2>

            {currentCase.evidence_items.length === 0 ? (
              <p className="text-xs text-text-muted font-mono">No evidence registered in locker.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-ink-800 text-text-faint uppercase text-[10px]">
                      <th className="py-2 pr-3">Ref ID</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3">Source & Collector</th>
                      <th className="py-2 pl-3">Collected At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-800/60">
                    {currentCase.evidence_items.map((e) => (
                      <tr key={e.id} className="text-text-muted hover:text-text-primary">
                        <td className="py-2.5 pr-3 font-semibold text-text-primary">{e.id.substring(0, 8)}</td>
                        <td className="py-2.5 px-3 uppercase text-[10px] text-tag-amber">{e.evidence_type}</td>
                        <td className="py-2.5 px-3 max-w-[240px] truncate text-text-primary">{e.description}</td>
                        <td className="py-2.5 px-3">{e.source} ({e.collected_by})</td>
                        <td className="py-2.5 pl-3 text-tag-amber font-mono">{new Date(e.collected_at).toUTCString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Next Steps & Timeline findings */}
          <div className="bg-ink-900 border border-ink-800 rounded-lg p-5 space-y-3 print:bg-gray-50 print:border-gray-300">
            <h2 className="text-xs font-mono uppercase text-tag-amber font-bold tracking-wider">
              3. Investigative Advisory & Chronological Summary
            </h2>
            <div className="p-3 bg-ink-950 rounded border border-ink-800 font-mono text-xs text-text-primary print:bg-white print:border-gray-200">
              <span className="text-[10px] text-text-faint uppercase block mb-1">Advisory Status:</span>
              No specific next steps triggered by this evidence. Manual review recommended.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
