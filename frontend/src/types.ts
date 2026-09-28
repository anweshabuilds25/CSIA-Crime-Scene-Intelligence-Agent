export type CaseStatus = 'open' | 'under_investigation' | 'cold' | 'closed';
export type CasePriority = 'low' | 'medium' | 'high' | 'critical';

export type EvidenceType =
  | 'image'
  | 'video'
  | 'document'
  | 'witness_statement'
  | 'cctv_frame'
  | 'physical'
  | 'other';

export interface ChainOfCustodyRecord {
  action: string;
  by: string;
  timestamp: string;
  notes?: string;
}

export interface YoloDetection {
  class_name: string;
  confidence: number;
  bounding_box: [number, number, number, number]; // [xmin, ymin, xmax, ymax]
}

export interface ExtractedOcrText {
  text: string;
  confidence: number;
  bounding_box: number[][];
}

export interface NlpEntities {
  names?: string[];
  locations?: string[];
  time_mentions?: string[];
  orgs?: string[];
}

export interface EvidenceExtraMetadata {
  yolo_detections?: string[];
  detailed_detections?: YoloDetection[];
  extracted_ocr?: ExtractedOcrText[];
  nlp_entities?: NlpEntities;
  full_text?: string;
  raw_file_name?: string;
  file_size?: number;
  [key: string]: any;
}

export interface EvidenceItem {
  id: string;
  case_id: string;
  evidence_type: EvidenceType;
  description: string;
  source: string;
  file_url: string | null;
  collected_by: string;
  collected_at: string;
  extra_metadata: EvidenceExtraMetadata;
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
  status: CaseStatus;
  priority: CasePriority;
  location: string;
  assigned_investigator: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  evidence_count?: number;
  evidence_items: EvidenceItem[];
}

export interface TimelineEvent {
  event: string;
  timestamp: string;
  evidence_id?: string;
  evidence_type?: string;
}

export interface NlpGraphNode {
  id: string;
  type: string;
}

export interface NlpGraphEdge {
  source: string;
  target: string;
  context: string;
}

export interface NlpExtractionResponse {
  case_id: string;
  summary: string[];
  entities: Array<{
    text: string;
    label: string;
    start: number;
    end: number;
  }>;
  relationship_graph: {
    nodes: NlpGraphNode[];
    edges: NlpGraphEdge[];
  };
}
