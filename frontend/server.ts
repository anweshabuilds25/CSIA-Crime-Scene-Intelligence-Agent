import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ---------------------------------------------------------------------------
// In-Memory Database & Seed Data
// ---------------------------------------------------------------------------

export interface ChainOfCustodyRecord {
  action: string;
  by: string;
  timestamp: string;
  notes?: string;
}

export interface EvidenceItem {
  id: string;
  case_id: string;
  evidence_type: string;
  description: string;
  source: string;
  file_url: string | null;
  collected_by: string;
  collected_at: string;
  extra_metadata: Record<string, any>;
  chain_of_custody: ChainOfCustodyRecord[];
  created_at: string;
  updated_at: string | null;
}

export interface Case {
  id: string;
  case_number: string;
  title: string;
  description: string;
  crime_type: string;
  status: string;
  priority: string;
  location: string;
  assigned_investigator: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  evidence_items: EvidenceItem[];
}

const casesDb = new Map<string, Case>();

// Load seed data from backend/sample_case.json if available
const seedCases: Case[] = [
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    case_number: "CSIA-2026-00001",
    title: "Robbery at Shivani General Store",
    description: "Break-in reported at approx 22:40. Cash register forced open, CCTV covers front entrance only.",
    crime_type: "robbery",
    status: "under_investigation",
    priority: "high",
    location: "Shivani General Store, MG Road, Ashta",
    assigned_investigator: "Insp. R. Sharma",
    tags: ["armed", "cctv-available", "night-incident"],
    created_at: "2026-08-24T10:00:00Z",
    updated_at: "2026-08-24T16:12:00Z",
    closed_at: null,
    evidence_items: [
      {
        id: "9c4e2b10-8a1e-4f3b-9d2a-1e2f3a4b5c6d",
        case_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        evidence_type: "image",
        description: "Photo of forced cash register showing pry marks",
        source: "Investigator phone camera",
        file_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
        collected_by: "Const. P. Verma",
        collected_at: "2026-08-24T11:00:00Z",
        extra_metadata: {
          yolo_detections: ["crowbar", "cash_register"],
          detailed_detections: [
            { class_name: "crowbar", confidence: 0.91, bounding_box: [120, 80, 240, 310] },
            { class_name: "cash_register", confidence: 0.96, bounding_box: [90, 60, 480, 420] }
          ],
          extracted_ocr: [
            { text: "TOTAL BAL 14,200", confidence: 0.88, bounding_box: [[140, 200], [290, 200], [290, 240], [140, 240]] }
          ]
        },
        chain_of_custody: [
          { action: "collected", by: "Const. P. Verma", timestamp: "2026-08-24T11:00:00Z" },
          { action: "transferred_to_forensics", by: "Insp. R. Sharma", timestamp: "2026-08-24T13:30:00Z" }
        ],
        created_at: "2026-08-24T11:00:00Z",
        updated_at: null
      },
      {
        id: "7b3d1a20-6c2f-4e5a-8b1d-2f3e4a5b6c7d",
        case_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        evidence_type: "witness_statement",
        description: "Shopkeeper statement: heard noise around 22:40, saw two men flee towards the bus stand.",
        source: "Shopkeeper - Ramesh Patel",
        file_url: null,
        collected_by: "Insp. R. Sharma",
        collected_at: "2026-08-24T14:00:00Z",
        extra_metadata: {
          nlp_entities: {
            names: ["Ramesh Patel", "Vikram"],
            locations: ["bus stand", "MG Road"],
            time_mentions: ["22:40"],
            orgs: ["Shivani General Store"]
          },
          full_text: "I was closing up the back inventory when I heard glass breaking at 22:40. Two young men in dark hooded jackets smashed the front window and pried open the cash register. I saw one man shouting to Vikram to hurry before police arrived. They grabbed the money pouch and ran towards the bus stand on MG Road."
        },
        chain_of_custody: [
          { action: "collected", by: "Insp. R. Sharma", timestamp: "2026-08-24T14:00:00Z" }
        ],
        created_at: "2026-08-24T14:00:00Z",
        updated_at: null
      },
      {
        id: "3d8a9e14-2b7c-4821-b461-91a7c0f12a88",
        case_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        evidence_type: "cctv_frame",
        description: "Front entrance CCTV still at 22:42:15 showing suspect running with black backpack",
        source: "Store Security DVR Channel 01",
        file_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
        collected_by: "Tech. A. Deshmukh",
        collected_at: "2026-08-24T15:20:00Z",
        extra_metadata: {
          yolo_detections: ["backpack"],
          detailed_detections: [
            { class_name: "backpack", confidence: 0.89, bounding_box: [180, 140, 320, 380] }
          ]
        },
        chain_of_custody: [
          { action: "collected", by: "Tech. A. Deshmukh", timestamp: "2026-08-24T15:20:00Z" }
        ],
        created_at: "2026-08-24T15:20:00Z",
        updated_at: null
      }
    ]
  },
  {
    id: "5fa91b12-92a1-4321-bb11-48291f092b11",
    case_number: "CSIA-2026-00002",
    title: "Armed Robbery & Assault at Apex Electronics",
    description: "Late evening assault and burglary at retail depot. Display cases smashed, sharp weapon recovered behind warehouse alley.",
    crime_type: "assault",
    status: "under_investigation",
    priority: "critical",
    location: "Apex Electronics, Sector 4 Commercial Hub",
    assigned_investigator: "Insp. S. Kulkarni",
    tags: ["weapon-recovered", "critical", "forensics-pending"],
    created_at: "2026-08-28T09:15:00Z",
    updated_at: "2026-08-28T14:40:00Z",
    closed_at: null,
    evidence_items: [
      {
        id: "e1a90c12-7102-4ab1-8901-7192a01f88c1",
        case_id: "5fa91b12-92a1-4321-bb11-48291f092b11",
        evidence_type: "physical",
        description: "8-inch serrated hunting knife retrieved from rear trash bin",
        source: "Scene technician sweep",
        file_url: null,
        collected_by: "Forensic Officer K. Nair",
        collected_at: "2026-08-28T10:30:00Z",
        extra_metadata: {
          yolo_detections: ["knife"],
          detailed_detections: [
            { class_name: "knife", confidence: 0.94, bounding_box: [100, 120, 410, 260] }
          ]
        },
        chain_of_custody: [
          { action: "collected", by: "Forensic Officer K. Nair", timestamp: "2026-08-28T10:30:00Z" },
          { action: "sealed_in_tamper_bag", by: "Insp. S. Kulkarni", timestamp: "2026-08-28T11:15:00Z" }
        ],
        created_at: "2026-08-28T10:30:00Z",
        updated_at: null
      }
    ]
  },
  {
    id: "78ac8910-1289-4bc2-a109-8192aa0099bb",
    case_number: "CSIA-2026-00003",
    title: "Warehouse Burglary - North Docks",
    description: "Overnight unauthorized entry into container yard. Padlocks cut with industrial cutters.",
    crime_type: "burglary",
    status: "open",
    priority: "medium",
    location: "Pier 14 Logistics Yard, Industrial Area",
    assigned_investigator: "Insp. R. Sharma",
    tags: ["cargo", "night-shift"],
    created_at: "2026-09-01T08:00:00Z",
    updated_at: "2026-09-01T08:00:00Z",
    closed_at: null,
    evidence_items: []
  }
];

seedCases.forEach(c => casesDb.set(c.id, c));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseDateSafe(str?: string | null): number {
  if (!str) return 0;
  const t = Date.parse(str);
  return isNaN(t) ? 0 : t;
}

// Rule table per next_step_rules.py
const OBJECT_SUGGESTION_RULES: Record<string, string> = {
  knife: "A knife was detected in the evidence. Suggest documenting it as physical evidence and checking for nearby CCTV coverage.",
  backpack: "A bag was detected in the frame. Suggest checking if it was recovered or left at the scene.",
  crowbar: "Forced entry tool (crowbar) detected. Suggest swabbing for latent touch-DNA and paint-transfer comparison.",
  cash_register: "Forced register identified. Check register audit log for exact timestamp of drawer disconnect."
};

const EVIDENCE_GAP_RULES = [
  {
    trigger_objects: ["knife", "weapon"],
    missing_evidence_type: "cctv_frame",
    suggestion: "A potential weapon was detected but no CCTV footage has been uploaded for this case yet. Suggest checking nearby CCTV."
  },
  {
    trigger_objects: ["knife", "backpack", "crowbar"],
    missing_evidence_type: "witness_statement",
    suggestion: "Physical evidence was detected but no witness statement exists yet. Suggest following up for a statement."
  }
];

function generateSuggestions(evidenceList: EvidenceItem[]): string[] {
  if (!evidenceList || evidenceList.length === 0) {
    return ["No evidence available to generate suggestions. Please attach evidence items to initialize suggestions."];
  }

  const detectedClasses = new Set<string>();
  const existingTypes = new Set<string>();

  for (const item of evidenceList) {
    if (item.evidence_type) existingTypes.add(item.evidence_type);
    const meta = item.extra_metadata || {};
    const classes = meta.yolo_detections || [];
    classes.forEach((c: string) => detectedClasses.add(c.toLowerCase()));
  }

  const suggestions: string[] = [];

  for (const cls of detectedClasses) {
    if (OBJECT_SUGGESTION_RULES[cls]) {
      suggestions.push(OBJECT_SUGGESTION_RULES[cls]);
    }
  }

  for (const rule of EVIDENCE_GAP_RULES) {
    const hasTrigger = rule.trigger_objects.some(t => detectedClasses.has(t));
    const missingType = !existingTypes.has(rule.missing_evidence_type);
    if (hasTrigger && missingType) {
      suggestions.push(rule.suggestion);
    }
  }

  if (suggestions.length === 0) {
    suggestions.push("No specific next steps triggered by current evidence. Manual investigator review recommended.");
  }

  return suggestions;
}

function buildTimeline(evidenceList: EvidenceItem[]) {
  if (!evidenceList || evidenceList.length === 0) {
    return [];
  }

  const sorted = [...evidenceList].sort((a, b) => {
    const timeA = parseDateSafe(a.collected_at || a.created_at);
    const timeB = parseDateSafe(b.collected_at || b.created_at);
    return timeA - timeB;
  });

  return sorted.map(item => {
    const metadata = item.extra_metadata || {};
    const yolo = metadata.yolo_detections || [];
    const nlp = metadata.nlp_entities || {};

    let desc = item.description;
    if (!desc && yolo.length > 0) {
      desc = `Detected: ${yolo.join(', ')}`;
    } else if (!desc && nlp.names && nlp.names.length > 0) {
      desc = `Statement mentions: ${nlp.names.join(', ')}`;
    } else if (!desc) {
      desc = "Unknown event";
    }

    return {
      event: desc,
      timestamp: item.collected_at || item.created_at || "Unknown time",
      evidence_id: item.id,
      evidence_type: item.evidence_type
    };
  });
}

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

// Health checks
app.get(['/api/v1/health', '/api/health', '/health'], (_req: Request, res: Response) => {
  res.json({ status: "ok", app: "CSIA API", version: "0.1.0" });
});

app.get('/api/v1/nlp/health', (_req: Request, res: Response) => {
  res.json({ status: "ok", module: "nlp_engine" });
});

// Cases CRUD
app.get('/api/v1/cases', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.page_size as string, 10) || 20;
  const q = (req.query.q as string || '').toLowerCase().trim();
  const status = req.query.status as string;
  const crimeType = req.query.crime_type as string;
  const priority = req.query.priority as string;
  const investigator = req.query.assigned_investigator as string;
  const tag = req.query.tag as string;

  let cases = Array.from(casesDb.values());

  if (q) {
    cases = cases.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.case_number.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  }

  if (status) cases = cases.filter(c => c.status === status);
  if (crimeType) cases = cases.filter(c => c.crime_type.toLowerCase() === crimeType.toLowerCase());
  if (priority) cases = cases.filter(c => c.priority === priority);
  if (investigator) cases = cases.filter(c => c.assigned_investigator.toLowerCase().includes(investigator.toLowerCase()));
  if (tag) cases = cases.filter(c => c.tags.includes(tag));

  // Sort newest first
  cases.sort((a, b) => parseDateSafe(b.created_at) - parseDateSafe(a.created_at));

  const total = cases.length;
  const start = (page - 1) * pageSize;
  const paginated = cases.slice(start, start + pageSize);

  const results = paginated.map(c => ({
    id: c.id,
    case_number: c.case_number,
    title: c.title,
    description: c.description,
    crime_type: c.crime_type,
    status: c.status,
    priority: c.priority,
    location: c.location,
    assigned_investigator: c.assigned_investigator,
    tags: c.tags,
    created_at: c.created_at,
    updated_at: c.updated_at,
    closed_at: c.closed_at,
    evidence_count: c.evidence_items.length
  }));

  res.json({
    total,
    page,
    page_size: pageSize,
    results
  });
});

app.post('/api/v1/cases', (req: Request, res: Response) => {
  const body = req.body || {};
  const id = crypto.randomUUID();
  const caseCount = casesDb.size + 1;
  const caseNumber = body.case_number || `CSIA-2026-${String(caseCount).padStart(5, '0')}`;
  const now = new Date().toISOString();

  const newCase: Case = {
    id,
    case_number: caseNumber,
    title: body.title || 'Untitled Investigation',
    description: body.description || '',
    crime_type: body.crime_type || 'unclassified',
    status: body.status || 'under_investigation',
    priority: body.priority || 'medium',
    location: body.location || 'Unknown Location',
    assigned_investigator: body.assigned_investigator || 'Unassigned',
    tags: Array.isArray(body.tags) ? body.tags : [],
    created_at: now,
    updated_at: now,
    closed_at: body.status === 'closed' ? now : null,
    evidence_items: []
  };

  casesDb.set(id, newCase);
  res.status(201).json(newCase);
});

app.get('/api/v1/cases/:id', (req: Request, res: Response) => {
  const caseItem = casesDb.get(req.params.id);
  if (!caseItem) {
    return res.status(404).json({ detail: "Case not found" });
  }
  res.json(caseItem);
});

app.put('/api/v1/cases/:id', (req: Request, res: Response) => {
  const caseItem = casesDb.get(req.params.id);
  if (!caseItem) {
    return res.status(404).json({ detail: "Case not found" });
  }

  const updates = req.body || {};
  const updatedCase: Case = {
    ...caseItem,
    ...updates,
    id: caseItem.id, // Immutable ID
    evidence_items: caseItem.evidence_items, // Preserve evidence
    updated_at: new Date().toISOString()
  };

  if (updates.status === 'closed' && !caseItem.closed_at) {
    updatedCase.closed_at = new Date().toISOString();
  } else if (updates.status && updates.status !== 'closed') {
    updatedCase.closed_at = null;
  }

  casesDb.set(req.params.id, updatedCase);
  res.json(updatedCase);
});

app.delete('/api/v1/cases/:id', (req: Request, res: Response) => {
  const exists = casesDb.has(req.params.id);
  if (!exists) {
    return res.status(404).json({ detail: "Case not found" });
  }
  casesDb.delete(req.params.id);
  res.status(204).send();
});

// Evidence Routes
app.post('/api/v1/cases/:id/evidence', (req: Request, res: Response) => {
  const caseItem = casesDb.get(req.params.id);
  if (!caseItem) {
    return res.status(404).json({ detail: "Case not found" });
  }

  const body = req.body || {};
  const now = new Date().toISOString();
  const evidenceId = crypto.randomUUID();

  const newEvidence: EvidenceItem = {
    id: evidenceId,
    case_id: caseItem.id,
    evidence_type: body.evidence_type || 'other',
    description: body.description || 'Evidence item',
    source: body.source || 'Investigator upload',
    file_url: body.file_url || null,
    collected_by: body.collected_by || caseItem.assigned_investigator,
    collected_at: body.collected_at || now,
    extra_metadata: body.extra_metadata || {},
    chain_of_custody: Array.isArray(body.chain_of_custody) && body.chain_of_custody.length > 0
      ? body.chain_of_custody
      : [{ action: 'collected', by: body.collected_by || caseItem.assigned_investigator, timestamp: body.collected_at || now }],
    created_at: now,
    updated_at: null
  };

  caseItem.evidence_items.push(newEvidence);
  caseItem.updated_at = now;
  casesDb.set(caseItem.id, caseItem);

  res.status(201).json(newEvidence);
});

app.get('/api/v1/evidence/:id', (req: Request, res: Response) => {
  for (const c of casesDb.values()) {
    const item = c.evidence_items.find(e => e.id === req.params.id);
    if (item) return res.json(item);
  }
  res.status(404).json({ detail: "Evidence not found" });
});

// Search routes
app.get('/api/v1/search/cases', (req: Request, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase().trim();
  const results = Array.from(casesDb.values()).filter(c =>
    !q ||
    c.title.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.location.toLowerCase().includes(q) ||
    c.case_number.toLowerCase().includes(q)
  );

  res.json({
    total: results.length,
    page: 1,
    page_size: results.length,
    results: results.map(c => ({
      ...c,
      evidence_count: c.evidence_items.length
    }))
  });
});

app.get('/api/v1/search/evidence', (req: Request, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase().trim();
  const evidenceType = req.query.evidence_type as string;
  const caseId = req.query.case_id as string;

  let allEvidence: EvidenceItem[] = [];
  casesDb.forEach(c => {
    if (!caseId || c.id === caseId) {
      allEvidence.push(...c.evidence_items);
    }
  });

  if (q) {
    allEvidence = allEvidence.filter(e =>
      e.description.toLowerCase().includes(q) ||
      e.source.toLowerCase().includes(q) ||
      e.collected_by.toLowerCase().includes(q)
    );
  }

  if (evidenceType) {
    allEvidence = allEvidence.filter(e => e.evidence_type === evidenceType);
  }

  res.json({
    total: allEvidence.length,
    page: 1,
    page_size: allEvidence.length,
    results: allEvidence
  });
});

// Timeline & Suggestions
app.get(['/cases/:case_id/timeline', '/api/v1/cases/:case_id/timeline'], (req: Request, res: Response) => {
  const caseItem = casesDb.get(req.params.case_id);
  if (!caseItem) return res.status(404).json({ detail: "Case not found" });
  if (caseItem.evidence_items.length === 0) {
    return res.status(400).json({ detail: `Case ${req.params.case_id} has no evidence yet — nothing to build a timeline from.` });
  }

  const timeline = buildTimeline(caseItem.evidence_items);
  res.json({ success: true, case_id: req.params.case_id, timeline });
});

app.get(['/cases/:case_id/next-steps', '/api/v1/cases/:case_id/next-steps'], (req: Request, res: Response) => {
  const caseItem = casesDb.get(req.params.case_id);
  if (!caseItem) return res.status(404).json({ detail: "Case not found" });
  if (caseItem.evidence_items.length === 0) {
    return res.status(400).json({ detail: `Case ${req.params.case_id} has no evidence yet — nothing to base suggestions on.` });
  }

  const suggestions = generateSuggestions(caseItem.evidence_items);
  res.json({ success: true, case_id: req.params.case_id, next_steps: suggestions });
});

app.get(['/cases/:case_id/timeline-and-next-steps', '/api/v1/cases/:case_id/timeline-and-next-steps'], (req: Request, res: Response) => {
  const caseItem = casesDb.get(req.params.case_id);
  if (!caseItem) return res.status(404).json({ detail: "Case not found" });

  const timeline = buildTimeline(caseItem.evidence_items);
  const nextSteps = generateSuggestions(caseItem.evidence_items);

  res.json({
    success: true,
    case_id: req.params.case_id,
    timeline,
    next_steps: nextSteps
  });
});

// NLP Engine endpoints
app.post('/api/v1/nlp/extract', (req: Request, res: Response) => {
  const { case_id, statement_text } = req.body || {};
  if (!statement_text || !statement_text.trim()) {
    return res.status(400).json({ detail: "statement_text cannot be empty" });
  }

  const text: string = statement_text.trim();

  // Rule & heuristic entity extraction for PERSON, GPE/LOC, ORG/FAC, TIME
  const entities: Array<{ text: string; label: string; start: number; end: number }> = [];
  const foundSet = new Set<string>();

  // Extract Persons
  const personPatterns = [
    /\b(?:Insp\.|Constable|Const\.|Officer|Dr\.|Mr\.|Mrs\.|Ms\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g,
    /\b(Vikram|Ramesh|Patel|Sharma|Verma|Kulkarni|Nair|Deshmukh|Rahul|Ankit|Amit|Pooja|Suresh|Mohan|Anita|Deepak)\b/g
  ];
  for (const regex of personPatterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const matchText = match[1] || match[0];
      if (!foundSet.has(matchText.toLowerCase())) {
        foundSet.add(matchText.toLowerCase());
        entities.push({
          text: matchText,
          label: "PERSON",
          start: match.index,
          end: match.index + matchText.length
        });
      }
    }
  }

  // Extract Locations / GPE
  const locPatterns = [
    /\b(?:at|near|towards|to|in|on)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Road|Street|Avenue|Lane|Stand|Station|Market|Square|Hub|Pier|Alley|Yard|Store)))\b/gi,
    /\b(bus stand|MG Road|Sector 4|North Docks|Pier 14|Ashta|commercial hub)\b/gi
  ];
  for (const regex of locPatterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const locText = match[1] || match[0];
      if (!foundSet.has(locText.toLowerCase())) {
        foundSet.add(locText.toLowerCase());
        entities.push({
          text: locText,
          label: "LOC",
          start: match.index,
          end: match.index + locText.length
        });
      }
    }
  }

  // Extract Time Mentions
  const timePatterns = [
    /\b(?:\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]m)?|\d{1,2}\s*[ap]m|midnight|noon|overnight)\b/gi
  ];
  for (const regex of timePatterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const timeText = match[0];
      if (!foundSet.has(timeText.toLowerCase())) {
        foundSet.add(timeText.toLowerCase());
        entities.push({
          text: timeText,
          label: "TIME",
          start: match.index,
          end: match.index + timeText.length
        });
      }
    }
  }

  // Extract Organizations / Facilities
  const orgPatterns = [
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:General Store|Electronics|Logistics|Jewelers|Bank|Bakery|Cafe|Mart|Depot))\b/g,
    /\b(Shivani General Store|Apex Electronics|North Docks Logistics)\b/gi
  ];
  for (const regex of orgPatterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const orgText = match[1] || match[0];
      if (!foundSet.has(orgText.toLowerCase())) {
        foundSet.add(orgText.toLowerCase());
        entities.push({
          text: orgText,
          label: "ORG",
          start: match.index,
          end: match.index + orgText.length
        });
      }
    }
  }

  // Sentence splitting
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  // Extractive summary
  const summary = sentences.slice(0, 3);

  // Relationship graph construction
  const nodesMap = new Map<string, string>();
  entities.forEach(e => nodesMap.set(e.text, e.label));

  const edges: Array<{ source: string; target: string; context: string }> = [];
  const edgeKeys = new Set<string>();

  for (const sentence of sentences) {
    const present = entities.filter(e => sentence.toLowerCase().includes(e.text.toLowerCase()));
    for (let i = 0; i < present.length; i++) {
      for (let j = i + 1; j < present.length; j++) {
        const u = present[i].text;
        const v = present[j].text;
        if (u !== v) {
          const key = [u, v].sort().join(':::');
          if (!edgeKeys.has(key)) {
            edgeKeys.add(key);
            edges.push({
              source: u,
              target: v,
              context: sentence
            });
          }
        }
      }
    }
  }

  const nodes = Array.from(nodesMap.entries()).map(([id, type]) => ({ id, type }));

  res.json({
    case_id: case_id || 'unassigned',
    summary: summary.length > 0 ? summary : [text],
    entities,
    relationship_graph: {
      nodes,
      edges
    }
  });
});

// Image Analysis / OCR Endpoint
app.post(['/api/v1/image-analysis/analyze', '/image-api/analyze'], (req: Request, res: Response) => {
  // Support file uploads or base64 or mock analyze
  const fileName = req.body?.filename || req.query.filename || "evidence_sample.jpg";

  // Simulate crime-scene object detection and OCR matching project brief
  const detections = [
    { class_name: "knife", confidence: 0.94, bounding_box: [140, 190, 420, 310] },
    { class_name: "backpack", confidence: 0.88, bounding_box: [320, 110, 560, 440] }
  ];

  const ocrResults = [
    { text: "EVIDENCE SEAL 0492", confidence: 0.95, bounding_box: [[100, 50], [280, 50], [280, 85], [100, 85]] },
    { text: "PROPERTY OF ASHTA DEPOT", confidence: 0.89, bounding_box: [[100, 95], [360, 95], [360, 130], [100, 130]] }
  ];

  res.json({
    status: "success",
    device_used: "node-in-memory",
    detections,
    ocr: ocrResults,
    file_processed: fileName
  });
});

// Case Report Generation (HTML / JSON Dossier)
app.get(['/cases/:case_id/report', '/api/v1/cases/:case_id/report'], (req: Request, res: Response) => {
  const caseItem = casesDb.get(req.params.case_id);
  if (!caseItem) {
    return res.status(404).json({ detail: "Case not found" });
  }

  const timeline = buildTimeline(caseItem.evidence_items);
  const nextSteps = generateSuggestions(caseItem.evidence_items);

  const format = req.query.format as string;
  if (format === 'json') {
    return res.json({
      case_dossier: caseItem,
      timeline,
      next_steps: nextSteps,
      generated_at: new Date().toISOString()
    });
  }

  // Generate printable HTML Report
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CSIA Report — ${caseItem.case_number}</title>
  <style>
    body { font-family: 'IBM Plex Sans', -apple-system, sans-serif; background: #0B0E15; color: #E8EAF0; padding: 40px; margin: 0; }
    .header { border-bottom: 2px solid #E8A33D; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
    h1 { margin: 0; font-size: 26px; color: #E8A33D; font-family: monospace; letter-spacing: 1px; }
    .badge { display: inline-block; padding: 4px 10px; background: #202839; border-radius: 4px; font-size: 12px; margin-right: 8px; text-transform: uppercase; }
    .section { background: #0F1420; border: 1px solid #202839; border-radius: 6px; padding: 20px; margin-bottom: 24px; }
    .section h2 { margin-top: 0; color: #8B93A7; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #171D2B; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { text-align: left; padding: 10px; border-bottom: 1px solid #171D2B; font-size: 13px; }
    th { color: #8B93A7; font-family: monospace; }
    .step-item { background: #171D2B; border-left: 3px solid #E8A33D; padding: 10px 14px; margin-bottom: 8px; font-size: 13px; }
    .timestamp { font-family: monospace; color: #E8A33D; }
    @media print {
      body { background: #ffffff; color: #000000; }
      .section { background: #fafafa; border-color: #ddd; }
      h1 { color: #000; }
      .step-item { background: #eee; border-left-color: #333; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>CRIME SCENE INTELLIGENCE ASSISTANT</h1>
      <p style="margin: 4px 0 0 0; color: #8B93A7; font-size: 14px;">Case Dossier & Evidence Log</p>
    </div>
    <div style="text-align: right; font-family: monospace; font-size: 13px;">
      <div>CASE: ${caseItem.case_number}</div>
      <div style="color: #8B93A7;">GEN: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC</div>
    </div>
  </div>

  <div class="section">
    <h2>1. Case Overview</h2>
    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${caseItem.title}</div>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">${caseItem.description}</p>
    <div style="margin-top: 14px;">
      <span class="badge">Status: ${caseItem.status}</span>
      <span class="badge">Priority: ${caseItem.priority}</span>
      <span class="badge">Crime: ${caseItem.crime_type}</span>
      <span class="badge">Investigator: ${caseItem.assigned_investigator}</span>
      <span class="badge">Location: ${caseItem.location}</span>
    </div>
  </div>

  <div class="section">
    <h2>2. Evidence Log (${caseItem.evidence_items.length} items)</h2>
    ${caseItem.evidence_items.length === 0 ? '<p style="color: #8B93A7;">No evidence registered.</p>' : `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Type</th>
          <th>Description</th>
          <th>Source / Collected By</th>
          <th>Collected At</th>
        </tr>
      </thead>
      <tbody>
        ${caseItem.evidence_items.map(e => `
          <tr>
            <td style="font-family: monospace; font-size: 11px;">${e.id.substring(0, 8)}</td>
            <td><span class="badge">${e.evidence_type}</span></td>
            <td>${e.description}</td>
            <td>${e.source} (${e.collected_by})</td>
            <td class="timestamp">${e.collected_at || e.created_at}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    `}
  </div>

  <div class="section">
    <h2>3. Chronological Reconstruction Timeline</h2>
    ${timeline.length === 0 ? '<p style="color: #8B93A7;">Insufficient data to establish timeline.</p>' : `
    <table>
      <thead>
        <tr>
          <th>Timestamp (UTC)</th>
          <th>Event Description</th>
          <th>Evidence Link</th>
        </tr>
      </thead>
      <tbody>
        ${timeline.map(t => `
          <tr>
            <td class="timestamp" style="width: 220px;">${t.timestamp}</td>
            <td>${t.event}</td>
            <td style="font-family: monospace; font-size: 11px; width: 140px;">${t.evidence_id ? t.evidence_id.substring(0, 8) : 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    `}
  </div>

  <div class="section">
    <h2>4. Rule-Based Next-Step Suggestions & Gap Analysis</h2>
    ${nextSteps.map(s => `<div class="step-item">${s}</div>`).join('')}
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// ---------------------------------------------------------------------------
// Vite Dev Server / Static File Serving
// ---------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CSIA Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
