import React, { useState, useEffect } from 'react';
import { Case, EvidenceItem } from './types';
import { casesService, evidenceService } from './services/api';
import { Navbar } from './components/Navbar';
import { CaseList } from './components/CaseList';
import { CaseOverview } from './components/CaseOverview';
import { EvidenceLocker } from './components/EvidenceLocker';
import { TimelineView } from './components/TimelineView';
import { NextStepsView } from './components/NextStepsView';
import { NlpGraphView } from './components/NlpGraphView';
import { ImageAnalysisStudio } from './components/ImageAnalysisStudio';
import { ReportModal } from './components/ReportModal';
import { NewCaseModal } from './components/NewCaseModal';
import { Shield, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [showNewCase, setShowNewCase] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Fetch Cases from API service layer (currently serving verified stable demo dataset)
  const fetchCases = async (searchQuery?: string) => {
    try {
      setLoading(true);
      const res = await casesService.getCases({ q: searchQuery });
      const list = res.results || [];
      setCases(list);

      if (list.length > 0) {
        // Keep active case selection or select first
        const currentId = activeCase ? activeCase.id : list[0].id;
        const detail = await casesService.getCase(currentId);
        setActiveCase(detail || list[0]);
      } else {
        setActiveCase(null);
      }
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSelectCase = async (c: Case) => {
    try {
      const detail = await casesService.getCase(c.id);
      setActiveCase(detail || c);
    } catch {
      setActiveCase(c);
    }
  };

  const handleUpdateCase = async (updatedFields: Partial<Case>) => {
    if (!activeCase) return;
    try {
      const updated = await casesService.updateCase(activeCase.id, updatedFields);
      if (updated) {
        setActiveCase(updated);
        setCases((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
      }
    } catch (err) {
      console.error('Failed to update case:', err);
    }
  };

  const handleAddEvidence = async (evidenceData: Partial<EvidenceItem>) => {
    if (!activeCase) return;
    try {
      const newEvidence = await evidenceService.addEvidence(activeCase.id, evidenceData);
      if (newEvidence) {
        const refreshed = await casesService.getCase(activeCase.id);
        if (refreshed) {
          setActiveCase(refreshed);
          setCases((prev) => prev.map((c) => (c.id === refreshed.id ? refreshed : c)));
        }
      }
    } catch (err) {
      console.error('Failed to add evidence:', err);
    }
  };

  const handleCreateCase = async (caseData: Partial<Case>) => {
    try {
      const newCase = await casesService.createCase(caseData);
      setCases((prev) => [newCase, ...prev]);
      setActiveCase(newCase);
      setShowNewCase(false);
      setActiveTab('overview');
    } catch (err) {
      console.error('Failed to create case:', err);
    }
  };

  const handleAttachNlpStatement = async (statement: string, entities: any[]) => {
    if (!activeCase) return;
    await handleAddEvidence({
      evidence_type: 'witness_statement',
      description: `Witness statement: ${statement.substring(0, 50)}...`,
      source: 'Witness Interview',
      collected_by: activeCase.assigned_investigator,
      collected_at: new Date().toISOString(),
      extra_metadata: {
        statement_full_text: statement,
        detected_entities: entities,
        category: 'witness_statement'
      },
    });
  };

  // Derive dashboard statistics directly from the current cases dataset
  const totalCasesCount = cases.length;
  const openCasesCount = cases.filter((c) => c.status === 'open').length;
  const highPriorityCount = cases.filter((c) => c.priority === 'high' || c.priority === 'critical').length;
 const totalEvidenceCount = cases.reduce((acc, c) => acc + (c.evidence_count ?? c.evidence_items?.length ?? 0), 0);

  if (loading && cases.length === 0) {
    return (
      <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center text-text-muted font-mono space-y-3">
        <RefreshCw className="w-8 h-8 text-tag-amber animate-spin" />
        <p className="text-xs uppercase tracking-widest text-text-primary">
          Loading CSIA Investigation Workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 text-text-primary flex flex-col font-body">
      {/* Platform Navigation */}
      <Navbar
        cases={cases}
        activeCase={activeCase}
        onSelectCase={handleSelectCase}
        onOpenNewCase={() => setShowNewCase(true)}
        onOpenReport={() => setShowReport(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickSearch={(query) => {
          setGlobalSearch(query);
          fetchCases(query);
        }}
      />

      {/* Main Investigation Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Case Navigator */}
          <div className="lg:col-span-4 h-[680px]">
            <CaseList
              cases={cases}
              activeCase={activeCase}
              onSelectCase={handleSelectCase}
              onOpenNewCase={() => setShowNewCase(true)}
              searchTerm={globalSearch}
              onSearchChange={(val) => {
                setGlobalSearch(val);
                fetchCases(val);
              }}
            />
          </div>

          {/* Right Column: Case Intelligence Workspace */}
          <div className="lg:col-span-8 space-y-6">
            {!activeCase ? (
              <div className="bg-ink-900 border border-ink-800 rounded-lg p-12 text-center text-text-muted font-mono text-xs space-y-3">
                <AlertCircle className="w-8 h-8 text-tag-amber mx-auto" />
                <p>No investigation case selected.</p>
                <button
                  onClick={() => setShowNewCase(true)}
                  className="bg-tag-amber text-ink-950 font-bold px-3 py-1.5 rounded uppercase"
                >
                  Create New Case
                </button>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <CaseOverview
                    currentCase={activeCase}
                    totalCasesCount={totalCasesCount}
                    openCasesCount={openCasesCount}
                    highPriorityCount={highPriorityCount}
                    totalEvidenceCount={totalEvidenceCount}
                    onUpdateCase={handleUpdateCase}
                    onNavigateTab={setActiveTab}
                    onOpenNewCase={() => setShowNewCase(true)}
                  />
                )}

                {activeTab === 'evidence' && (
                  <EvidenceLocker
                    currentCase={activeCase}
                    onAddEvidence={handleAddEvidence}
                  />
                )}

                {activeTab === 'timeline' && (
                  <TimelineView currentCase={activeCase} />
                )}

                {activeTab === 'next_steps' && (
                  <NextStepsView currentCase={activeCase} />
                )}

                {activeTab === 'nlp_graph' && (
                  <NlpGraphView
                    currentCase={activeCase}
                    onAttachStatement={handleAttachNlpStatement}
                  />
                )}

                {activeTab === 'image_scanner' && (
                  <ImageAnalysisStudio
                    currentCase={activeCase}
                    onAttachEvidence={handleAddEvidence}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Report Dossier Modal */}
      {showReport && activeCase && (
        <ReportModal currentCase={activeCase} onClose={() => setShowReport(false)} />
      )}

      {/* New Case Creation Modal */}
      {showNewCase && (
        <NewCaseModal
          onClose={() => setShowNewCase(false)}
          onCreateCase={handleCreateCase}
        />
      )}
    </div>
  );
}
