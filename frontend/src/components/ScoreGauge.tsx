import React from 'react';
import { ShieldCheck, AlertTriangle, XOctagon } from 'lucide-react';

interface ScoreGaugeProps {
  score: number; // 0 to 100
  riskSummary: {
    totalClauses: number;
    standardCount: number;
    cautionCount: number;
    unfavorableCount: number;
  };
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, riskSummary }) => {
  // Determine color theme based on score
  const getColor = (s: number) => {
    if (s >= 80) return { stroke: '#10b981', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Fair & Balanced' };
    if (s >= 55) return { stroke: '#f59e0b', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Moderate Risk' };
    return { stroke: '#ef4444', text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', label: 'Predatory / High Risk' };
  };

  const theme = getColor(score);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <section aria-labelledby="health-score-title" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-6">
        {/* Circular SVG Gauge */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-slate-100"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={theme.stroke}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-3xl font-extrabold tracking-tight ${theme.text}`}>
              {score}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Status & Description */}
        <div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${theme.bg} ${theme.text} ${theme.border} mb-1.5`}>
            {theme.label}
          </span>
          <h2 id="health-score-title" className="text-xl font-bold text-slate-900">
            Overall Contract Health Score
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            Calculated by cross-referencing your document against 40+ market-standard legal benchmarks using dual-tier vector similarity and directional semantic delta scoring.
          </p>
        </div>
      </div>

      {/* Risk Summary Counts */}
      <div className="grid grid-cols-3 gap-3 w-full md:w-auto shrink-0">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" /> Standard
          </div>
          <p className="text-2xl font-black text-emerald-800 mt-1">{riskSummary.standardCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Market Aligned</span>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-700 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" /> Caution
          </div>
          <p className="text-2xl font-black text-amber-800 mt-1">{riskSummary.cautionCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Needs Review</span>
        </div>

        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-rose-700 font-bold text-sm">
            <XOctagon className="w-4 h-4" /> Unfavorable
          </div>
          <p className="text-2xl font-black text-rose-800 mt-1">{riskSummary.unfavorableCount}</p>
          <span className="text-[10px] text-rose-600 font-medium">Aggressive Traps</span>
        </div>
      </div>
    </section>
  );
};
