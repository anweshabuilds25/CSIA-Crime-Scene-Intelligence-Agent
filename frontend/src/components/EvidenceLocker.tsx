import React, { useState } from 'react';
import {
  Layers,
  Image as ImageIcon,
  FileText,
  Video,
  Shield,
  Plus,
  Search,
  Eye,
  CheckCircle,
  Clock,
  User,
  Scan,
  AlertTriangle,
  X,
  UploadCloud
} from 'lucide-react';
import { Case, EvidenceItem, EvidenceType } from '../types';

interface EvidenceLockerProps {
  currentCase: Case;
  onAddEvidence: (item: Partial<EvidenceItem>) => Promise<void> | void;
}

export const EvidenceLocker: React.FC<EvidenceLockerProps> = ({
  currentCase,
  onAddEvidence,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Evidence Form state
  const [newType, setNewType] = useState<EvidenceType>('image');
  const [newDesc, setNewDesc] = useState('');
  const [newSource, setNewSource] = useState('Crime scene camera');
  const [newCollectedBy, setNewCollectedBy] = useState(currentCase.assigned_investigator || 'Inspector Sharma');
  const [newCollectedAt, setNewCollectedAt] = useState(new Date().toISOString().substring(0, 16));
  const [newFileUrl, setNewFileUrl] = useState('');
  const [metadataLocation, setMetadataLocation] = useState(currentCase.location || 'Bhopal');
  const [metadataCategory, setMetadataCategory] = useState('crime_scene_photo');

  const filteredItems = currentCase.evidence_items.filter((item) => {
    const matchesType = filterType === 'all' || item.evidence_type === filterType;
    const matchesSearch =
      !searchTerm ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.collected_by.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getEvidenceTypeIcon = (type: EvidenceType) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-tag-amber" />;
      case 'cctv_frame':
        return <Video className="w-4 h-4 text-tag-rust" />;
      case 'witness_statement':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'physical':
        return <Shield className="w-4 h-4 text-tag-moss" />;
      default:
        return <Layers className="w-4 h-4 text-text-muted" />;
    }
  };

  const handleCreateEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    setSubmitting(true);
    try {
      await onAddEvidence({
        evidence_type: newType,
        description: newDesc.trim(),
        source: newSource.trim(),
        collected_by: newCollectedBy.trim() || currentCase.assigned_investigator,
        collected_at: newCollectedAt.includes('Z') ? newCollectedAt : new Date(newCollectedAt).toISOString(),
        file_url: newFileUrl.trim() || null,
        extra_metadata: {
          location: metadataLocation.trim() || currentCase.location,
          category: metadataCategory.trim() || 'crime_scene_photo',
          yolo_detections: [],
          detailed_detections: [],
          extracted_ocr: []
        },
        chain_of_custody: [
          {
            action: 'Collected',
            by: newCollectedBy.trim() || currentCase.assigned_investigator,
            timestamp: new Date().toISOString(),
            notes: 'Field evidence intake'
          }
        ]
      });

      // Reset and close
      setNewDesc('');
      setNewFileUrl('');
      setShowAddModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header & Filtering */}
      <div className="bg-ink-900 border border-ink-700/80 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search evidence locker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-ink-950 border border-ink-700 rounded text-xs pl-8 pr-3 py-1.5 text-text-primary placeholder-text-faint focus:outline-none focus:border-tag-amber font-mono"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto text-xs font-mono">
            {['all', 'image', 'cctv_frame', 'witness_statement', 'physical', 'document'].map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 rounded transition whitespace-nowrap capitalize ${
                    filterType === type
                      ? 'bg-ink-800 text-tag-amber border border-tag-amber/30 font-semibold'
                      : 'bg-ink-950 text-text-muted border border-ink-800 hover:text-text-primary'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              )
            )}
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto flex items-center justify-center space-x-1.5 bg-tag-amber text-ink-950 font-mono text-xs font-bold px-3 py-2 rounded transition hover:bg-tag-amber/90 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Evidence</span>
        </button>
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-ink-900 border border-ink-800 rounded-lg p-12 text-center text-text-muted">
            <Layers className="w-8 h-8 text-text-faint mx-auto mb-2" />
            <p className="font-mono text-xs">No evidence items match your filters.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const chainLength = item.chain_of_custody?.length || 1;

            return (
              <div
                key={item.id}
                className="bg-ink-900 border border-ink-700/80 rounded-lg overflow-hidden flex flex-col justify-between hover:border-tag-amber/40 transition group"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-3 bg-ink-950/60 border-b border-ink-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getEvidenceTypeIcon(item.evidence_type)}
                      <span className="font-mono text-[11px] text-text-muted uppercase font-semibold">
                        {item.evidence_type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-text-faint">
                      {item.id.substring(0, 8)}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    {/* Visual Preview if image or cctv */}
                    {item.file_url ? (
                      <div className="relative rounded overflow-hidden h-36 bg-ink-950 border border-ink-800">
                        <img
                          src={item.file_url}
                          alt={item.description}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            // Fallback to placeholder if external url fails
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-28 rounded bg-ink-950 border border-ink-800 flex items-center justify-center text-text-faint font-mono text-xs">
                        Physical / Document Exhibit
                      </div>
                    )}

                    <h4 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug">
                      {item.description}
                    </h4>

                    {/* Metadata tags */}
                    {item.extra_metadata && (
                      <div className="flex flex-wrap gap-1">
                        {item.extra_metadata.location && (
                          <span className="bg-ink-950 text-text-muted text-[10px] font-mono px-1.5 py-0.5 rounded border border-ink-800">
                            loc: {item.extra_metadata.location}
                          </span>
                        )}
                        {item.extra_metadata.category && (
                          <span className="bg-ink-950 text-text-muted text-[10px] font-mono px-1.5 py-0.5 rounded border border-ink-800">
                            cat: {item.extra_metadata.category}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-text-muted font-mono space-y-1 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-text-faint text-[10px] uppercase">Source:</span>
                        <span className="truncate max-w-[160px] text-text-primary">{item.source}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-faint text-[10px] uppercase">Collected By:</span>
                        <span className="truncate max-w-[160px]">{item.collected_by}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-faint text-[10px] uppercase">Timestamp:</span>
                        <span className="text-tag-amber">{new Date(item.collected_at).toUTCString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer / Action */}
                <div className="p-3 bg-ink-950/40 border-t border-ink-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-[11px] font-mono text-text-faint">
                    <CheckCircle className="w-3 h-3 text-tag-moss" />
                    <span>{chainLength} Custody Record</span>
                  </div>

                  <button
                    onClick={() => setSelectedItem(item)}
                    className="flex items-center space-x-1 text-xs font-mono text-tag-amber hover:text-tag-amber/80 font-medium transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Evidence Deep Inspection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ink-900 border border-ink-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-ink-800 flex items-center justify-between sticky top-0 bg-ink-900 z-10">
              <div className="flex items-center space-x-2">
                {getEvidenceTypeIcon(selectedItem.evidence_type)}
                <h3 className="font-display font-semibold uppercase tracking-wider text-sm text-text-primary">
                  Evidence Inspector // {selectedItem.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Visual preview if image */}
              {selectedItem.file_url && (
                <div className="space-y-2">
                  <span className="text-xs font-mono text-text-muted uppercase">Visual Evidence Exhibit</span>
                  <div className="relative rounded overflow-hidden bg-ink-950 border border-ink-800 max-h-80 flex items-center justify-center">
                    <img
                      src={selectedItem.file_url}
                      alt={selectedItem.description}
                      className="max-h-80 w-auto object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Description & Metadata */}
              <div className="space-y-3 bg-ink-950 p-4 rounded border border-ink-800 font-mono text-xs">
                <div>
                  <span className="text-text-faint text-[10px] uppercase block">Description:</span>
                  <span className="text-text-primary font-sans font-semibold text-sm">{selectedItem.description}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-ink-850">
                  <div>
                    <span className="text-text-faint text-[10px] uppercase block">Source:</span>
                    <span className="text-text-primary">{selectedItem.source}</span>
                  </div>
                  <div>
                    <span className="text-text-faint text-[10px] uppercase block">Collected By:</span>
                    <span className="text-text-primary">{selectedItem.collected_by}</span>
                  </div>
                  <div>
                    <span className="text-text-faint text-[10px] uppercase block">Collection Time:</span>
                    <span className="text-tag-amber">{selectedItem.collected_at}</span>
                  </div>
                  <div>
                    <span className="text-text-faint text-[10px] uppercase block">Case ID Reference:</span>
                    <span className="text-text-muted truncate block">{selectedItem.case_id}</span>
                  </div>
                </div>
              </div>

              {/* Metadata dictionary */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-text-muted uppercase">Metadata Attributes</span>
                <div className="bg-ink-950 p-3 rounded border border-ink-800 font-mono text-xs space-y-1">
                  {Object.entries(selectedItem.extra_metadata || {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-text-faint">{k}:</span>
                      <span className="text-text-primary">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chain of Custody */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-text-muted uppercase">Chain of Custody Audit Log</span>
                <div className="divide-y divide-ink-800 bg-ink-950 rounded border border-ink-800">
                  {selectedItem.chain_of_custody?.map((record, idx) => (
                    <div key={idx} className="p-3 text-xs font-mono flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-text-primary capitalize font-medium">{record.action}</div>
                        <div className="text-text-faint text-[10px]">Officer / Custodian: {record.by}</div>
                      </div>
                      <div className="text-text-muted text-[11px]">{record.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Upload Evidence Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ink-900 border border-ink-700 rounded-lg max-w-lg w-full shadow-2xl">
            <div className="p-4 border-b border-ink-800 flex items-center justify-between">
              <h3 className="font-display font-semibold uppercase tracking-wider text-sm text-text-primary">
                Add / Upload Evidence to Case
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvidence} className="p-5 space-y-4 text-xs font-mono">
              <div>
                <label className="text-text-muted uppercase text-[10px] block mb-1">Evidence Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as EvidenceType)}
                  className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber"
                >
                  <option value="image">Image (Photograph)</option>
                  <option value="cctv_frame">CCTV Frame</option>
                  <option value="witness_statement">Witness Statement</option>
                  <option value="physical">Physical Exhibit</option>
                  <option value="document">Document</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-text-muted uppercase text-[10px] block mb-1">Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Photograph of the crime scene"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                  className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber"
                />
              </div>

              <div>
                <label className="text-text-muted uppercase text-[10px] block mb-1">Evidence File URL / Image Link</label>
                <input
                  type="url"
                  placeholder="https://example.com/crime-scene.jpg"
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-muted uppercase text-[10px] block mb-1">Source</label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber"
                  />
                </div>
                <div>
                  <label className="text-text-muted uppercase text-[10px] block mb-1">Collected By</label>
                  <input
                    type="text"
                    value={newCollectedBy}
                    onChange={(e) => setNewCollectedBy(e.target.value)}
                    className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-muted uppercase text-[10px] block mb-1">Location Metadata</label>
                  <input
                    type="text"
                    value={metadataLocation}
                    onChange={(e) => setMetadataLocation(e.target.value)}
                    className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber"
                  />
                </div>
                <div>
                  <label className="text-text-muted uppercase text-[10px] block mb-1">Category Metadata</label>
                  <input
                    type="text"
                    value={metadataCategory}
                    onChange={(e) => setMetadataCategory(e.target.value)}
                    className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber"
                  />
                </div>
              </div>

              <div>
                <label className="text-text-muted uppercase text-[10px] block mb-1">Collection Date & Time</label>
                <input
                  type="datetime-local"
                  value={newCollectedAt}
                  onChange={(e) => setNewCollectedAt(e.target.value)}
                  className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-text-primary focus:outline-none focus:border-tag-amber"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-ink-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-ink-800 text-text-muted hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newDesc.trim()}
                  className="px-4 py-1.5 rounded bg-tag-amber text-ink-950 font-bold hover:bg-tag-amber/90 shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
