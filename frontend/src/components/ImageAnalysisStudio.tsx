import React, { useState } from 'react';
import { Scan, Eye, FileText, CheckCircle2, Plus, Sparkles, UploadCloud, Info, AlertCircle } from 'lucide-react';
import { Case, EvidenceItem } from '../types';
import { imageAnalysisService } from '../services/api';

interface ImageAnalysisStudioProps {
  currentCase: Case;
  onAttachEvidence: (item: Partial<EvidenceItem>) => void;
}

export const ImageAnalysisStudio: React.FC<ImageAnalysisStudioProps> = ({
  currentCase,
  onAttachEvidence,
}) => {
  const [selectedFileName, setSelectedFileName] = useState('festival-calendar-bg .png');
  const [customUrl, setCustomUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(true);
  const [scanResult, setScanResult] = useState<{
    tested_file: string;
    status: string;
    detections: any[];
    ocr: any[];
  }>({
    tested_file: 'festival-calendar-bg .png',
    status: 'success',
    detections: [],
    ocr: []
  });

  const handleRunAnalysis = async () => {
    setScanning(true);
    try {
      const res = await imageAnalysisService.analyzeImage(selectedFileName, customUrl);
      setScanResult(res);
      setHasScanned(true);
    } catch (err) {
      console.error('Image analysis error:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleSaveToEvidence = () => {
    onAttachEvidence({
      evidence_type: 'image',
      description: `Analysis artifact: ${scanResult.tested_file}`,
      source: 'Image Analysis Studio',
      file_url: customUrl || null,
      collected_by: currentCase.assigned_investigator,
      collected_at: new Date().toISOString(),
      extra_metadata: {
        tested_file: scanResult.tested_file,
        yolo_detections: scanResult.detections,
        extracted_ocr: scanResult.ocr,
        analysis_status: scanResult.status
      },
      chain_of_custody: [
        {
          action: 'Analyzed',
          by: currentCase.assigned_investigator,
          timestamp: new Date().toISOString(),
          notes: 'Processed through image analysis pipeline'
        }
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-ink-900 border border-ink-700/80 rounded-lg p-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-ink-800">
          <Scan className="w-5 h-5 text-tag-amber" />
          <h2 className="font-display font-semibold uppercase tracking-wider text-base text-text-primary">
            Image Analysis & Vision / OCR Pipeline
          </h2>
        </div>
        <p className="text-xs text-text-muted font-mono mt-2">
          Verify crime scene artifacts with object detection and optical character recognition (OCR).
        </p>

        {/* Tested Target Selector */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-mono uppercase text-text-faint block mb-1">
                Image File Name (Tested Target)
              </label>
              <input
                type="text"
                value={selectedFileName}
                onChange={(e) => setSelectedFileName(e.target.value)}
                className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-xs font-mono text-text-primary focus:outline-none focus:border-tag-amber"
              />
            </div>

            <div className="flex-1 w-full">
              <label className="text-[10px] font-mono uppercase text-text-faint block mb-1">
                Image URL / Preview Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://... (or leave empty)"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-xs font-mono text-text-primary focus:outline-none focus:border-tag-amber"
              />
            </div>

            <div className="self-end w-full sm:w-auto">
              <button
                onClick={handleRunAnalysis}
                disabled={scanning}
                className="w-full sm:w-auto flex items-center justify-center space-x-1.5 bg-tag-amber text-ink-950 font-mono text-xs font-bold px-4 py-2 rounded transition hover:bg-tag-amber/90 shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{scanning ? 'Running Analysis...' : 'Run Image Analysis'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Deliverables and Results */}
      {hasScanned && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual Display & File Context */}
          <div className="lg:col-span-2 bg-ink-900 border border-ink-700/80 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-ink-800 pb-3">
              <div>
                <span className="text-xs font-mono uppercase text-text-muted block">Processed Image Artifact</span>
                <span className="text-sm font-semibold text-text-primary font-mono">{scanResult.tested_file}</span>
              </div>
              <button
                onClick={handleSaveToEvidence}
                className="flex items-center space-x-1.5 bg-ink-800 hover:bg-ink-700 border border-ink-600 text-text-primary font-mono text-xs font-semibold px-3 py-1.5 rounded transition"
              >
                <Plus className="w-3.5 h-3.5 text-tag-amber" />
                <span>Save to Evidence</span>
              </button>
            </div>

            {/* Canvas / Placeholder Area */}
            <div className="relative rounded overflow-hidden bg-ink-950 border border-ink-800 min-h-[260px] flex flex-col items-center justify-center p-6 text-center">
              {customUrl ? (
                <img
                  src={customUrl}
                  alt={scanResult.tested_file}
                  className="max-h-72 w-auto object-contain"
                />
              ) : (
                <div className="space-y-2">
                  <Scan className="w-10 h-10 text-tag-amber/60 mx-auto" />
                  <div className="text-xs font-mono text-text-primary font-semibold">
                    File: {scanResult.tested_file}
                  </div>
                  <div className="text-[11px] font-mono text-text-faint">
                    Image buffer analyzed · Pipeline status: {scanResult.status}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detections & OCR Breakdown with proper empty-result states */}
          <div className="space-y-4">
            {/* YOLO Detections */}
            <div className="bg-ink-900 border border-ink-700/80 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-ink-800 pb-2">
                <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
                  Detected Objects
                </span>
                <span className="text-[10px] font-mono text-tag-amber">
                  {scanResult.detections.length} objects
                </span>
              </div>

              {scanResult.detections.length === 0 ? (
                <div className="bg-ink-950 p-4 rounded border border-ink-800 text-xs font-mono text-text-muted text-center space-y-1">
                  <div className="text-text-primary font-semibold">No objects detected</div>
                  <div className="text-[11px] text-text-faint">
                    The image did not yield any high-confidence YOLO detections.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {scanResult.detections.map((det: any, idx: number) => (
                    <div key={idx} className="bg-ink-950 p-2.5 rounded border border-ink-800 font-mono text-xs">
                      <span className="text-tag-amber font-bold">{det.class_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* OCR Extracted Text */}
            <div className="bg-ink-900 border border-ink-700/80 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-ink-800 pb-2">
                <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
                  OCR Text Results
                </span>
                <span className="text-[10px] font-mono text-blue-400">
                  {scanResult.ocr.length} snippets
                </span>
              </div>

              {scanResult.ocr.length === 0 ? (
                <div className="bg-ink-950 p-4 rounded border border-ink-800 text-xs font-mono text-text-muted text-center space-y-1">
                  <div className="text-text-primary font-semibold">No text detected</div>
                  <div className="text-[11px] text-text-faint">
                    No legible textual elements or serial numbers detected by OCR.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {scanResult.ocr.map((ocrItem: any, idx: number) => (
                    <div key={idx} className="bg-ink-950 p-2.5 rounded border border-ink-800 font-mono text-xs">
                      {ocrItem.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
