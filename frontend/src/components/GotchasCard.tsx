import React from 'react';
import { AlertOctagon, Lightbulb, ArrowRight } from 'lucide-react';
import { GotchaItem, ReadingLevel, RiskLevel } from '../types';

interface GotchasCardProps {
  gotchas: GotchaItem[];
  readingLevel: ReadingLevel;
  onSelectClause: (index: number) => void;
}

export const GotchasCard: React.FC<GotchasCardProps> = ({
  gotchas,
  readingLevel,
  onSelectClause,
}) => {
  if (gotchas.length === 0) return null;

  return (
    <section aria-labelledby="gotchas-heading" className="bg-rose-50/60 border border-rose-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-rose-600 text-white rounded-lg">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <h3 id="gotchas-heading" className="text-lg font-bold text-rose-950">
            "Before You Sign" Gotchas & Hidden Traps
          </h3>
          <p className="text-xs text-rose-700 font-medium">
            Immediate real-world consequences identified in this agreement.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gotchas.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-4 border border-rose-200/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  {item.title}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  item.riskLevel === RiskLevel.Unfavorable
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.riskLevel}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {readingLevel === 'ELI5' ? item.eli5Explanation : item.explanation}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex items-start gap-1.5 text-xs text-teal-800 bg-teal-50/80 p-2 rounded-lg border border-teal-100">
                <Lightbulb className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium leading-snug">
                  <strong>Action Tip:</strong> {item.actionableTip}
                </span>
              </div>

              <button
                onClick={() => onSelectClause(item.relatedClauseIndex)}
                className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center justify-end gap-1 mt-1 transition-colors"
                aria-label={`Jump to clause ${item.relatedClauseIndex + 1}`}
              >
                Jump to Clause #{item.relatedClauseIndex + 1}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
