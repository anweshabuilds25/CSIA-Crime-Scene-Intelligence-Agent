import { Case, EvidenceItem, TimelineEvent, NlpExtractionResponse } from '../types';
import {
  mockCases,
  mockEvidence,
  mockTimeline,
  mockNextSteps,
  mockNLPResults,
  mockImageAnalysis,
  DEMO_CASE_ID,
  DEMO_EVIDENCE_ID
} from '../data/mockData';

// In-memory state so frontend operations (creating case, adding evidence) work seamlessly in the session
let casesStore: Case[] = JSON.parse(JSON.stringify(mockCases));

export interface CasesResponse {
  total: number;
  page: number;
  page_size: number;
  results: Case[];
}

/**
 * Service: Cases
 * Future API mapping:
 * - getCases() -> GET /api/v1/cases
 * - getCase(id) -> GET /api/v1/cases/{case_id}
 * - createCase(payload) -> POST /api/v1/cases
 * - updateCase(id, payload) -> PUT /api/v1/cases/{case_id}
 */
export const casesService = {
  async getCases(params?: { q?: string; status?: string; priority?: string; crime_type?: string }): Promise<CasesResponse> {
    await new Promise((r) => setTimeout(r, 120)); // Simulate async network
    let list = [...casesStore];

    if (params?.q) {
      const q = params.q.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.case_number.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter((c) => c.status === params.status);
    }
    if (params?.priority && params.priority !== 'all') {
      list = list.filter((c) => c.priority === params.priority);
    }
    if (params?.crime_type && params.crime_type !== 'all') {
      list = list.filter((c) => c.crime_type.toLowerCase() === params.crime_type?.toLowerCase());
    }

    return {
      total: list.length,
      page: 1,
      page_size: list.length,
      results: list
    };
  },

  async getCase(caseId: string): Promise<Case | null> {
    await new Promise((r) => setTimeout(r, 80));
    const found = casesStore.find((c) => c.id === caseId);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  },

  async createCase(caseData: Partial<Case>): Promise<Case> {
    await new Promise((r) => setTimeout(r, 150));
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const newCaseNumber = caseData.case_number || `CSIA-2026-${String(casesStore.length + 4).padStart(3, '0')}`;

    const created: Case = {
      id,
      case_number: newCaseNumber,
      title: caseData.title || 'Untitled Investigation',
      description: caseData.description || '',
      crime_type: caseData.crime_type || 'Theft',
      status: caseData.status || 'open',
      priority: caseData.priority || 'medium',
      location: caseData.location || 'Bhopal',
      assigned_investigator: caseData.assigned_investigator || 'Inspector Sharma',
      tags: caseData.tags || [],
      created_at: now,
      updated_at: now,
      closed_at: caseData.status === 'closed' ? now : null,
      evidence_count: 0,
      evidence_items: []
    };

    casesStore = [created, ...casesStore];
    return JSON.parse(JSON.stringify(created));
  },

  async updateCase(caseId: string, updates: Partial<Case>): Promise<Case | null> {
    await new Promise((r) => setTimeout(r, 100));
    const index = casesStore.findIndex((c) => c.id === caseId);
    if (index === -1) return null;

    const existing = casesStore[index];
    const updated: Case = {
      ...existing,
      ...updates,
      id: existing.id, // preserve
      case_number: existing.case_number, // preserve
      updated_at: new Date().toISOString()
    };

    casesStore[index] = updated;
    return JSON.parse(JSON.stringify(updated));
  }
};

/**
 * Service: Evidence
 * Future API mapping:
 * - getEvidence(caseId) -> GET /api/v1/cases/{case_id}/evidence
 * - getEvidenceById(id) -> GET /api/v1/evidence/{evidence_id}
 * - addEvidence(caseId, payload) -> POST /api/v1/cases/{case_id}/evidence
 */
export const evidenceService = {
  async getEvidence(caseId: string): Promise<EvidenceItem[]> {
    await new Promise((r) => setTimeout(r, 100));
    const c = casesStore.find((item) => item.id === caseId);
    return c ? JSON.parse(JSON.stringify(c.evidence_items)) : [];
  },

  async addEvidence(caseId: string, itemData: Partial<EvidenceItem>): Promise<EvidenceItem | null> {
    await new Promise((r) => setTimeout(r, 150));
    const caseItem = casesStore.find((c) => c.id === caseId);
    if (!caseItem) return null;

    const now = new Date().toISOString();
    const newEvidence: EvidenceItem = {
      id: crypto.randomUUID(),
      case_id: caseId,
      evidence_type: itemData.evidence_type || 'image',
      description: itemData.description || 'Uploaded Evidence Item',
      source: itemData.source || 'Crime scene camera',
      file_url: itemData.file_url || null,
      collected_by: itemData.collected_by || caseItem.assigned_investigator,
      collected_at: itemData.collected_at || now,
      extra_metadata: itemData.extra_metadata || {
        location: caseItem.location,
        category: itemData.evidence_type
      },
      chain_of_custody: itemData.chain_of_custody && itemData.chain_of_custody.length > 0
        ? itemData.chain_of_custody
        : [{ action: 'Collected', by: itemData.collected_by || caseItem.assigned_investigator, timestamp: now }],
      created_at: now,
      updated_at: null
    };

    caseItem.evidence_items.push(newEvidence);
    caseItem.evidence_count = caseItem.evidence_items.length;
    caseItem.updated_at = now;

    return JSON.parse(JSON.stringify(newEvidence));
  },

  async getEvidenceById(evidenceId: string): Promise<EvidenceItem | null> {
    await new Promise((r) => setTimeout(r, 80));
    for (const c of casesStore) {
      const e = c.evidence_items.find((item) => item.id === evidenceId);
      if (e) return JSON.parse(JSON.stringify(e));
    }
    return null;
  }
};

/**
 * Service: Timeline
 * Future API mapping:
 * - getTimeline(caseId) -> GET /cases/{case_id}/timeline
 */
export const timelineService = {
  async getTimeline(caseId: string): Promise<{ success: boolean; case_id: string; timeline: TimelineEvent[] }> {
    await new Promise((r) => setTimeout(r, 100));
    const caseItem = casesStore.find((c) => c.id === caseId);

    // If active case is the demo case, return verified timeline
    if (caseId === DEMO_CASE_ID) {
      return {
        success: true,
        case_id: caseId,
        timeline: JSON.parse(JSON.stringify(mockTimeline))
      };
    }

    if (!caseItem || caseItem.evidence_items.length === 0) {
      return {
        success: true,
        case_id: caseId,
        timeline: []
      };
    }

    // Sort existing evidence chronologically by collected_at
    const sorted = [...caseItem.evidence_items].sort(
      (a, b) => new Date(a.collected_at).getTime() - new Date(b.collected_at).getTime()
    );

    const timeline: TimelineEvent[] = sorted.map((e) => ({
      event: e.description,
      timestamp: e.collected_at,
      evidence_id: e.id,
      evidence_type: e.evidence_type
    }));

    return {
      success: true,
      case_id: caseId,
      timeline
    };
  }
};

/**
 * Service: Next Steps
 * Future API mapping:
 * - getNextSteps(caseId) -> GET /cases/{case_id}/next-steps
 */
export const nextStepsService = {
  async getNextSteps(caseId: string): Promise<{ success: boolean; case_id: string; next_steps: string[] }> {
    await new Promise((r) => setTimeout(r, 100));

    // Return exact verified backend response for demo case
    if (caseId === DEMO_CASE_ID) {
      return {
        success: true,
        case_id: caseId,
        next_steps: JSON.parse(JSON.stringify(mockNextSteps))
      };
    }

    const caseItem = casesStore.find((c) => c.id === caseId);
    if (!caseItem || caseItem.evidence_items.length === 0) {
      return {
        success: true,
        case_id: caseId,
        next_steps: ['No evidence available to evaluate next steps. Manual review recommended.']
      };
    }

    return {
      success: true,
      case_id: caseId,
      next_steps: ['No specific next steps triggered by this evidence. Manual review recommended.']
    };
  }
};

/**
 * Service: NLP Analysis
 * Future API mapping:
 * - analyzeStatement(caseId, statementText) -> POST /api/v1/nlp/extract
 */
export const nlpService = {
  async analyzeStatement(caseId: string, statementText: string): Promise<NlpExtractionResponse> {
    await new Promise((r) => setTimeout(r, 150));

    const trimmed = statementText.trim();
    const demoStatement = 'Ravi saw the suspect near the shop in Bhopal. The suspect then entered Sharma Electronics.';

    // If input matches verified backend test statement, return verified response
    if (trimmed === demoStatement || trimmed.includes('Sharma Electronics') || trimmed.includes('Bhopal')) {
      return {
        ...mockNLPResults,
        case_id: caseId
      };
    }

    // Generic fallback mock with empty relationships matching backend behavior
    const sentences = trimmed
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return {
      case_id: caseId,
      summary: sentences.length > 0 ? sentences : [trimmed],
      entities: [
        { text: 'Bhopal', label: 'GPE', start: 0, end: 6 }
      ],
      relationship_graph: {
        nodes: [{ id: 'Bhopal', type: 'GPE' }],
        edges: []
      }
    };
  }
};

/**
 * Service: Image Analysis
 * Future API mapping:
 * - analyzeImage(filename, fileUrl) -> POST /api/v1/image-analysis/analyze
 */
export const imageAnalysisService = {
  async analyzeImage(filename: string, fileUrl?: string) {
    await new Promise((r) => setTimeout(r, 200));

    // Per test spec: festival-calendar-bg .png verified response:
    // status: success, detections: [], ocr: []
    return {
      tested_file: filename || 'festival-calendar-bg .png',
      status: 'success',
      detections: [],
      ocr: []
    };
  }
};

/**
 * Service: Search
 * Future API mapping:
 * - searchCases(q) -> GET /api/v1/search/cases?q={q}
 * - searchEvidence(q) -> GET /api/v1/search/evidence?q={q}
 */
export const searchService = {
  async searchCases(q: string): Promise<Case[]> {
    await new Promise((r) => setTimeout(r, 80));
    const term = q.toLowerCase().trim();
    if (!term) return [...casesStore];

    return casesStore.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.case_number.toLowerCase().includes(term) ||
        c.location.toLowerCase().includes(term) ||
        c.assigned_investigator.toLowerCase().includes(term) ||
        c.tags.some((t) => t.toLowerCase().includes(term))
    );
  },

  async searchEvidence(q: string, caseId?: string): Promise<EvidenceItem[]> {
    await new Promise((r) => setTimeout(r, 80));
    const term = q.toLowerCase().trim();
    let all: EvidenceItem[] = [];

    casesStore.forEach((c) => {
      if (!caseId || c.id === caseId) {
        all.push(...c.evidence_items);
      }
    });

    if (!term) return all;
    return all.filter(
      (e) =>
        e.description.toLowerCase().includes(term) ||
        e.source.toLowerCase().includes(term) ||
        e.collected_by.toLowerCase().includes(term) ||
        e.evidence_type.toLowerCase().includes(term)
    );
  }
};
