import { Case, EvidenceItem, TimelineEvent, NlpExtractionResponse } from '../types';

const API = (import.meta.env.VITE_API_URL || '') + '/api/v1';

export interface CasesResponse {
  total: number;
  page: number;
  page_size: number;
  results: Case[];
}

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  const r = await fetch(API + path, {
    ...init,
    headers: isForm ? {} : { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.status === 204 ? (undefined as T) : r.json();
}
const json = (method: string, body: any) => ({ method, body: JSON.stringify(body) });

export const casesService = {
  getCases: (p: { q?: string } = {}) =>
    http<CasesResponse>(`/search/cases?page_size=100${p.q ? `&q=${encodeURIComponent(p.q)}` : ''}`),
  getCase: (id: string) => http<Case>(`/cases/${id}`).catch(() => null),
  createCase: (d: Partial<Case>) => http<Case>('/cases', json('POST', d)),
  updateCase: (id: string, d: Partial<Case>) => http<Case>(`/cases/${id}`, json('PUT', d)),
};

export const evidenceService = {
  addEvidence: (id: string, d: Partial<EvidenceItem>) =>
    http<EvidenceItem>(`/cases/${id}/evidence`, json('POST', d)),
};

export const timelineService = {
  getTimeline: (id: string) =>
    http<{ success: boolean; case_id: string; timeline: TimelineEvent[] }>(`/cases/${id}/timeline`)
      .catch(() => ({ success: true, case_id: id, timeline: [] as TimelineEvent[] })),
};

export const nextStepsService = {
  getNextSteps: (id: string) =>
    http<{ success: boolean; case_id: string; next_steps: string[] }>(`/cases/${id}/next-steps`)
      .catch(() => ({ success: true, case_id: id, next_steps: [] as string[] })),
};

export const nlpService = {
  analyzeStatement: (caseId: string, text: string) =>
    http<NlpExtractionResponse>('/nlp/extract', json('POST', { case_id: caseId, statement_text: text })),
};

export const imageAnalysisService = {
  async analyzeImage(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const r = await http<any>('/image-analysis/analyze', { method: 'POST', body: fd });
    return {
      tested_file: file.name,
      status: r.status,
      detections: r.detections.map((d: any) => ({
        class_name: d.class,
        confidence: d.confidence,
        bounding_box: d.bbox,
      })),
      ocr: r.ocr,
    };
  },
};