import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertCircle, CheckSquare, Square, Info } from 'lucide-react';
import { Case } from '../types';
import { nextStepsService } from '../services/api';

interface NextStepsViewProps {
  currentCase: Case;
}

export const NextStepsView: React.FC<NextStepsViewProps> = ({ currentCase }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);

  const fetchNextSteps = async () => {
    setLoading(true);
    try {
      const res = await nextStepsService.getNextSteps(currentCase.id);
      setSuggestions(res.next_steps || []);
    } catch (err) {
      console.error('Failed to load next steps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextSteps();
  }, [currentCase.id, currentCase.evidence_items.length]);

  const toggleComplete = (idx: number) => {
    setCompleted((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="bg-ink-900 border border-ink-700/80 rounded-lg p-5 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-tag-amber" />
            <h2 className="font-display font-semibold uppercase tracking-wider text-base text-text-primary">
              AI-Suggested Next Steps & Advisory
            </h2>
          </div>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            Verified investigation advisory based on active case evidence evaluation
          </p>
        </div>

        <button
          onClick={fetchNextSteps}
          disabled={loading}
          className="flex items-center space-x-1.5 text-xs font-mono bg-ink-800 hover:bg-ink-700 border border-ink-700 text-text-primary px-3 py-1.5 rounded transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-tag-amber ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Advisory Status Note */}
      <div className="bg-ink-950/70 border border-ink-800 rounded p-4 text-xs font-mono flex items-start space-x-3">
        <Info className="w-4 h-4 text-tag-amber shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-text-primary font-medium">Evaluation Note</div>
          <p className="text-text-muted text-[11px] leading-relaxed">
            The next-step rule engine evaluates current evidence items and flags missing investigative steps or procedural recommendations.
          </p>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-3">
        {suggestions.length === 0 ? (
          <div className="p-8 text-center text-text-muted font-mono text-xs">
            No suggestions available.
          </div>
        ) : (
          suggestions.map((suggestion, idx) => {
            const isDone = !!completed[idx];
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border transition flex items-start space-x-3.5 ${
                  isDone
                    ? 'bg-ink-950/40 border-ink-800 opacity-60'
                    : 'bg-ink-950/90 border-ink-800 hover:border-tag-amber/40'
                }`}
              >
                <button
                  onClick={() => toggleComplete(idx)}
                  className="mt-0.5 text-tag-amber hover:text-tag-amber/80 transition shrink-0"
                >
                  {isDone ? (
                    <CheckSquare className="w-5 h-5 text-tag-moss" />
                  ) : (
                    <Square className="w-5 h-5 text-text-muted" />
                  )}
                </button>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-tag-amber">
                      ADVISORY #{idx + 1}
                    </span>
                    {isDone && (
                      <span className="bg-tag-moss/20 text-tag-moss border border-tag-moss/30 text-[10px] font-mono px-1.5 py-0.2 rounded uppercase">
                        Reviewed & Actioned
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-sm leading-relaxed ${
                      isDone ? 'line-through text-text-muted font-body' : 'text-text-primary font-body font-medium'
                    }`}
                  >
                    {suggestion}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
