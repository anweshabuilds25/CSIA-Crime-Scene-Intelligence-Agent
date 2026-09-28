import React, { useState } from 'react';
import { Brain, Sparkles, User, MapPin, Building2, Clock, GitBranch, Plus, Info, Network } from 'lucide-react';
import { Case, NlpExtractionResponse, NlpGraphNode } from '../types';
import { nlpService } from '../services/api';

interface NlpGraphViewProps {
  currentCase: Case;
  onAttachStatement: (statement: string, entities: any[]) => void;
}

export const NlpGraphView: React.FC<NlpGraphViewProps> = ({ currentCase, onAttachStatement }) => {
  const [statementText, setStatementText] = useState(
    'Ravi saw the suspect near the shop in Bhopal. The suspect then entered Sharma Electronics.'
  );
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<NlpExtractionResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<NlpGraphNode | null>(null);

  const runNlpExtraction = async () => {
    if (!statementText.trim()) return;
    setLoading(true);
    setSelectedNode(null);

    try {
      const response = await nlpService.analyzeStatement(currentCase.id, statementText);
      setExtractedData(response);
    } catch (err) {
      console.error('NLP extraction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNodeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PERSON':
        return 'bg-tag-amber text-ink-950 border-tag-amber/80';
      case 'LOC':
      case 'GPE':
        return 'bg-blue-400 text-ink-950 border-blue-400/80';
      case 'ORG':
      case 'FAC':
        return 'bg-purple-400 text-ink-950 border-purple-400/80';
      case 'TIME':
        return 'bg-tag-moss text-ink-950 border-tag-moss/80';
      default:
        return 'bg-ink-700 text-text-primary border-ink-600';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PERSON':
        return <User className="w-3.5 h-3.5" />;
      case 'LOC':
      case 'GPE':
        return <MapPin className="w-3.5 h-3.5" />;
      case 'ORG':
      case 'FAC':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'TIME':
        return <Clock className="w-3.5 h-3.5" />;
      default:
        return <GitBranch className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Workbench Header */}
      <div className="bg-ink-900 border border-ink-700/80 rounded-lg p-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-ink-800">
          <Brain className="w-5 h-5 text-tag-amber" />
          <h2 className="font-display font-semibold uppercase tracking-wider text-base text-text-primary">
            NLP Entity Extraction & Relationship Graph
          </h2>
        </div>
        <p className="text-xs text-text-muted font-mono mt-2">
          Extract named entities (suspects, locations, shops) and build relationship co-occurrence networks from witness statements.
        </p>

        {/* Input box */}
        <div className="mt-4 space-y-3">
          <label className="text-[11px] font-mono uppercase text-text-muted block">
            Witness / Investigation Statement Transcript
          </label>
          <textarea
            rows={3}
            value={statementText}
            onChange={(e) => setStatementText(e.target.value)}
            className="w-full bg-ink-950 border border-ink-700 rounded p-3 text-xs text-text-primary font-mono focus:outline-none focus:border-tag-amber leading-relaxed"
            placeholder="Type or paste witness testimony..."
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-[11px] font-mono text-text-muted">
              <span>Entity types:</span>
              <span className="text-blue-400">GPE (Location)</span>
              <span>·</span>
              <span className="text-purple-400">ORG (Organization)</span>
            </div>

            <button
              onClick={runNlpExtraction}
              disabled={loading || !statementText.trim()}
              className="flex items-center space-x-1.5 bg-tag-amber text-ink-950 font-mono text-xs font-bold px-4 py-2 rounded transition hover:bg-tag-amber/90 shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Extracting Entities...' : 'Run Statement Analysis'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {extractedData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Summary & Entities */}
          <div className="space-y-4">
            {/* Extractive Summary */}
            <div className="bg-ink-900 border border-ink-700/80 rounded-lg p-4 space-y-2">
              <span className="text-xs font-mono text-text-muted uppercase tracking-wider block">
                Extracted Summary ({extractedData.summary.length} sentences)
              </span>
              <ul className="space-y-2 text-xs text-text-primary/90 font-body">
                {extractedData.summary.map((sent, idx) => (
                  <li key={idx} className="flex items-start space-x-2 bg-ink-950 p-2.5 rounded border border-ink-800">
                    <span className="text-tag-amber font-mono font-bold">{idx + 1}.</span>
                    <span>{sent}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Extracted Entities List */}
            <div className="bg-ink-900 border border-ink-700/80 rounded-lg p-4 space-y-2">
              <span className="text-xs font-mono text-text-muted uppercase tracking-wider block">
                Detected Entities ({extractedData.entities.length})
              </span>
              <div className="space-y-2">
                {extractedData.entities.map((ent, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedNode({ id: ent.text, type: ent.label })}
                    className="p-2.5 rounded bg-ink-950 border border-ink-800 flex items-center justify-between cursor-pointer hover:border-tag-amber/50 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`p-1 rounded text-xs ${getNodeColor(ent.label)}`}>
                        {getNodeIcon(ent.label)}
                      </span>
                      <span className="text-xs font-semibold text-text-primary font-mono">{ent.text}</span>
                    </div>
                    <div className="text-right text-[10px] font-mono text-text-faint">
                      <span className="text-tag-amber font-bold">{ent.label}</span>
                      <div>pos: {ent.start}–{ent.end}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save into Evidence Action */}
            <button
              onClick={() => {
                onAttachStatement(statementText, extractedData.entities);
              }}
              className="w-full flex items-center justify-center space-x-1.5 bg-ink-800 hover:bg-ink-700 border border-ink-600 text-text-primary font-mono text-xs font-semibold py-2 rounded transition"
            >
              <Plus className="w-3.5 h-3.5 text-tag-amber" />
              <span>Attach Statement to Evidence Locker</span>
            </button>
          </div>

          {/* Right Column: Visual Relationship Graph */}
          <div className="lg:col-span-2 bg-ink-900 border border-ink-700/80 rounded-lg p-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-ink-800 pb-3">
              <div>
                <span className="text-xs font-mono text-text-muted uppercase tracking-wider block">
                  Relationship Graph Canvas
                </span>
                <span className="text-[11px] text-text-faint font-mono">
                  {extractedData.relationship_graph.nodes.length} Nodes · {extractedData.relationship_graph.edges.length} Verified Edges
                </span>
              </div>
            </div>

            {/* Visual Canvas */}
            <div className="min-h-[280px] bg-ink-950 rounded-lg border border-ink-800 p-6 flex flex-col justify-between">
              {/* Nodes */}
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-text-faint uppercase">Identified Entity Nodes:</span>
                <div className="flex flex-wrap gap-3">
                  {extractedData.relationship_graph.nodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3 rounded-lg border flex items-center space-x-2.5 cursor-pointer transition ${
                          isSelected
                            ? 'bg-tag-amber text-ink-950 border-tag-amber shadow-lg scale-105'
                            : 'bg-ink-900 text-text-primary border-ink-700 hover:border-tag-amber/60'
                        }`}
                      >
                        <span className={`p-1.5 rounded text-xs ${getNodeColor(node.type)}`}>
                          {getNodeIcon(node.type)}
                        </span>
                        <div>
                          <div className="text-xs font-mono font-bold leading-tight">{node.id}</div>
                          <div className="text-[10px] opacity-75 font-mono uppercase">{node.type}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Edge connections & Verified Response State */}
              <div className="mt-8 pt-4 border-t border-ink-800 space-y-2">
                <span className="text-[10px] font-mono text-text-faint uppercase">
                  Relationship Edges:
                </span>
                {extractedData.relationship_graph.edges.length === 0 ? (
                  <div className="p-4 rounded bg-ink-900/60 border border-ink-800 text-xs font-mono text-text-muted flex items-start space-x-2.5">
                    <Info className="w-4 h-4 text-tag-amber shrink-0 mt-0.5" />
                    <div>
                      <span className="text-text-primary font-semibold block mb-0.5">No Relationship Edges Returned</span>
                      <p className="text-[11px] text-text-faint leading-relaxed">
                        Currently no relationship edges were returned by the tested NLP response for this statement. Entities are isolated nodes without co-occurrence link assertions.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {extractedData.relationship_graph.edges.map((edge, idx) => (
                      <div key={idx} className="p-2.5 rounded border border-ink-800 bg-ink-900 text-xs font-mono">
                        {edge.source} ↔ {edge.target}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
