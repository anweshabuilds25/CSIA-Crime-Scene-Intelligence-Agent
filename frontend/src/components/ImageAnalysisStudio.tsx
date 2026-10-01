import React, { useState } from 'react';
import { Scan, Plus, Sparkles } from 'lucide-react';
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
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState<{
    tested_file: string;
    status: string;
    detections: any[];
    ocr: any[];
  } | null>(null);

  const handleRunAnalysis = async () => {
    if (!file) return;
    setScanning(true);
    setError('');
    try {
      const res = await imageAnalysisService.analyzeImage(file);
      setScanResult(res);
    } catch (err) {
      console.error('Image analysis error:', err);
      setError('Analysis failed. Check that the backend is running.');
    } finally {
      setScanning(false);
    }
  };

  const handleSaveToEvidence = () => {
    if (!scanResult) return;
    onAttachEvidence({
      evidence_type: 'image',
      description: `Analysis artifact: ${scanResult.tested_file}`,
      source: 'Image Analysis Studio',
      file_url: null,
      collected_by: currentCase.assigned_investigator,
      collected_at: new Date().toISOString(),
      extra_metadata: {
        tested_file: scanResult.tested_file,
        yolo_detections: scanResult.detections.map((d: any) => d.class_name),
        detailed_detections: scanResult.detections,
        extracted_ocr: scanResult.ocr,
        analysis_status: scanResult.status,
      },
      chain_of_custody: [
        {
          action: 'Analyzed',
          by: currentCase.assigned_investigator,
          timestamp: new Date().toISOString(),
          notes: 'Processed through image analysis pipeline',
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-ink-900 border border-ink-700/80 rounded-lg p-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-ink-800">
          <Scan className="w-5 h-5 text-tag-amber" />
          <h2 className="font-display font-semibold uppercase tracking-wider text-base text-text-primary">
            Image Analysis & Vision / OCR Pipeline
          </h2>
        </div>
        <p className="text-xs text-text-muted font-mono mt-2">
          Upload an image from your computer to run object detection and OCR.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="text-[10px] font-mono uppercase text-text-faint block mb-1">
              Choose Image File
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                setScanResult(null);
                setPreviewUrl(f ? URL.createObjectURL(f) : '');
              }}
              className="w-full text-xs font-mono text-text-primary"
            />
          </div>
          <button
            onClick={handleRunAnalysis}
            disabled={scanning || !file}
            className="flex items-center space-x-1.5 bg-tag-amber text-ink-950 font-mono text-xs font-bold px-4 py-2 rounded hover:bg-tag-amber/90 shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{scanning ? 'Running Analysis...' : 'Run Image Analysis'}</span>
          </button>
        </div>
        {error && <p className="mt-3 text-xs font-mono text-tag-wine">{error}</p>}
      </div>

      {scanResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-ink-900 border border-ink-700/80 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-ink-800 pb-3">
              <div>
                <span className="text-xs font-mono uppercase text-text-muted block">Processed Image</span>
                <span className="text-sm font-semibold text-text-primary font-mono">{scanResult.tested_file}</span>
              </div>
              <button
                onClick={handleSaveToEvidence}
                className="flex items-center space-x-1.5 bg-ink-800 hover:bg-ink-700 border border-ink-600 text-text-primary font-mono text-xs font-semibold px-3 py-1.5 rounded"
              >
                <Plus className="w-3.5 h-3.5 text-tag-amber" />
                <span>Save to Evidence</span>
              </button>
            </div>
            <div className="rounded overflow-hidden bg-ink-950 border border-ink-800 min-h-[260px] flex items-center justify-center p-4">
              {previewUrl && <img src={previewUrl} alt="preview" className="max-h-72 w-auto object-contain" />}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-ink-900 border border-ink-700/80 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-ink-800 pb-2">
                <span className="text-xs font-mono text-text-muted uppercase">Detected Objects</span>
                <span className="text-[10px] font-mono text-tag-amber">{scanResult.detections.length} objects</span>
              </div>
              {scanResult.detections.length === 0 ? (
                <div className="text-xs font-mono text-text-muted text-center p-3">No objects detected</div>
              ) : (
                scanResult.detections.map((det: any, idx: number) => (
                  <div key={idx} className="bg-ink-950 p-2.5 rounded border border-ink-800 font-mono text-xs flex justify-between">
                    <span className="text-tag-amber font-bold">{det.class_name}</span>
                    <span className="text-text-muted">{Math.round(det.confidence * 100)}%</span>
                  </div>
                ))
              )}
            </div>

            <div className="bg-ink-900 border border-ink-700/80 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-ink-800 pb-2">
                <span className="text-xs font-mono text-text-muted uppercase">OCR Text</span>
                <span className="text-[10px] font-mono text-blue-400">{scanResult.ocr.length} snippets</span>
              </div>
              {scanResult.ocr.length === 0 ? (
                <div className="text-xs font-mono text-text-muted text-center p-3">No text detected</div>
              ) : (
                scanResult.ocr.map((o: any, idx: number) => (
                  <div key={idx} className="bg-ink-950 p-2.5 rounded border border-ink-800 font-mono text-xs">
                    {o.text}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};