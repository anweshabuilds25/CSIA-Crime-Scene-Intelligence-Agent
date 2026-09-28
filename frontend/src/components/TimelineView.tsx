import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Case, TimelineEvent } from '../types';
import { timelineService } from '../services/api';

interface TimelineViewProps {
  currentCase: Case;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ currentCase }) => {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const response = await timelineService.getTimeline(currentCase.id);
      setTimelineEvents(response.timeline || []);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [currentCase.id, currentCase.evidence_items.length]);

  return (
    <div className="bg-ink-900 border border-ink-700/80 rounded-lg p-5 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-tag-amber" />
            <h2 className="font-display font-semibold uppercase tracking-wider text-base text-text-primary">
              Investigation Timeline
            </h2>
          </div>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            Chronological reconstruction derived from verified case evidence
          </p>
        </div>

        <button
          onClick={fetchTimeline}
          disabled={loading}
          className="flex items-center space-x-1.5 text-xs font-mono bg-ink-800 hover:bg-ink-700 border border-ink-700 text-text-primary px-3 py-1.5 rounded transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-tag-amber ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Sequence</span>
        </button>
      </div>

      {timelineEvents.length === 0 ? (
        <div className="p-12 text-center text-text-muted font-mono text-xs space-y-2">
          <AlertCircle className="w-8 h-8 text-text-faint mx-auto" />
          <p>No timeline events recorded for this case yet.</p>
          <p className="text-text-faint">Add evidence items to reconstruct the sequence.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-ink-700">
          {timelineEvents.map((evt, idx) => {
            return (
              <div key={idx} className="relative group">
                {/* Node dot */}
                <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-ink-950 border-2 border-tag-amber group-hover:scale-125 transition" />

                <div className="bg-ink-950/80 border border-ink-800 group-hover:border-tag-amber/40 rounded-lg p-4 transition space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-tag-amber font-bold">EVENT #{idx + 1}</span>
                      {evt.evidence_type && (
                        <span className="bg-ink-800 text-text-muted px-1.5 py-0.5 rounded border border-ink-700 text-[10px] uppercase">
                          {evt.evidence_type}
                        </span>
                      )}
                    </div>
                    <span className="text-tag-amber font-mono font-medium">{evt.timestamp}</span>
                  </div>

                  <p className="text-sm font-semibold text-text-primary leading-snug">
                    {evt.event}
                  </p>

                  {evt.evidence_id && (
                    <div className="pt-2 border-t border-ink-800/80 flex items-center justify-between text-[11px] font-mono text-text-faint">
                      <span>Evidence ID: {evt.evidence_id}</span>
                      <span className="text-tag-moss flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Timeline Event</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
