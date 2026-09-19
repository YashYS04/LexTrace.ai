import React, { useState } from 'react';
import { GitCompare, Loader2 } from 'lucide-react';
import { ComparisonResult } from '../types';
import { SAMPLE_CONTRACTS } from '../data/sampleContracts';

export const CompareTab: React.FC = () => {
  const [doc1Text, setDoc1Text] = useState(SAMPLE_CONTRACTS[0]?.text || '');
  const [doc1Name, setDoc1Name] = useState('Version 1 (Aggressive Draft)');
  const [doc2Text, setDoc2Text] = useState(SAMPLE_CONTRACTS[1]?.text || '');
  const [doc2Name, setDoc2Name] = useState('Version 2 (Counter-Draft)');
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  const handleCompare = async () => {
    if (!doc1Text.trim() || !doc2Text.trim()) {
      alert('Please provide text for both contract versions.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/documents/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc1Text,
          doc1Name,
          doc2Text,
          doc2Name,
        }),
      });

      if (!res.ok) {
        const textResp = await res.text();
        let errMsg = `Server returned status ${res.status}`;
        try {
          const parsed = JSON.parse(textResp);
          if (parsed.error?.message) errMsg = parsed.error.message;
        } catch {
          if (textResp && textResp.length > 0) errMsg = textResp.slice(0, 200);
        }
        alert(`Comparison error: ${errMsg}`);
        return;
      }

      const json = await res.json();
      if (json.success) {
        setComparisonResult(json.data);
      } else {
        alert(`Comparison failed: ${json.error?.message}`);
      }
    } catch (err) {
      alert(`Network error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadPresetComparison = () => {
    setDoc1Text(SAMPLE_CONTRACTS[0]?.text || '');
    setDoc1Name('Freelance V1 (Original / Aggressive)');
    setDoc2Text(SAMPLE_CONTRACTS[1]?.text || '');
    setDoc2Name('Freelance V2 (Revised / Balanced)');
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Contract Version Comparison & Redlining</h2>
            <p className="text-xs text-slate-500">
              Detect sneaky risk shifts, inserted obligations, and altered liability terms between two contract drafts.
            </p>
          </div>

          <button
            onClick={loadPresetComparison}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-lg border border-slate-200 transition-colors"
          >
            Load Sample: Freelance V1 vs V2
          </button>
        </div>

        {/* Dual Input Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Doc 1 */}
          <div className="space-y-2">
            <input
              type="text"
              value={doc1Name}
              onChange={(e) => setDoc1Name(e.target.value)}
              className="w-full text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="Name of Version 1 (e.g. Original Lease)"
            />
            <textarea
              value={doc1Text}
              onChange={(e) => setDoc1Text(e.target.value)}
              rows={7}
              placeholder="Paste Version 1 text here..."
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Doc 2 */}
          <div className="space-y-2">
            <input
              type="text"
              value={doc2Name}
              onChange={(e) => setDoc2Name(e.target.value)}
              className="w-full text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="Name of Version 2 (e.g. Landlord's Revised Lease)"
            />
            <textarea
              value={doc2Text}
              onChange={(e) => setDoc2Text(e.target.value)}
              rows={7}
              placeholder="Paste Version 2 text here..."
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* Run Compare Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCompare}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Semantic Divergence...</span>
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4 text-teal-200" />
                <span>Compare & Redline Drafts</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive Divergence Card */}
          <section className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-teal-800/80">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-teal-300">
                  AI Redline Executive Summary
                </span>
                <h3 className="text-xl font-bold mt-1">
                  Comparing: {comparisonResult.doc1Name} ↔ {comparisonResult.doc2Name}
                </h3>
              </div>

              <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-right">
                <span className="text-[11px] text-teal-200 block">Who Benefits Most:</span>
                <span className="text-sm font-black text-white">{comparisonResult.whoBenefitsMost}</span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
              {comparisonResult.overallDivergenceSummary}
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-teal-200">
              <span>Total Modifications: <strong className="text-white">{comparisonResult.totalModifications}</strong></span>
              <span>High Risk Shifts: <strong className="text-white">{comparisonResult.highRiskShifts}</strong></span>
            </div>
          </section>

          {/* Clause-by-Clause Comparison Cards */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Clause-by-Clause Redlines & Risk Deltas</h3>

            {comparisonResult.clauseComparisons.map((item, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-xl border p-5 shadow-xs ${
                  item.status === 'modified'
                    ? 'border-amber-200'
                    : item.status === 'added'
                    ? 'border-teal-200'
                    : item.status === 'removed'
                    ? 'border-rose-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{item.clauseType}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        item.status === 'modified'
                          ? 'bg-amber-100 text-amber-800'
                          : item.status === 'added'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'removed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Risk Impact:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-md ${
                        item.riskImpact === 'Decreased'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.riskImpact === 'Increased'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.riskImpact}
                    </span>
                  </div>
                </div>

                {/* AI Semantic Shift */}
                <p className="text-xs text-slate-700 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <strong>Semantic Shift:</strong> {item.semanticShift}
                </p>

                {/* Visual Redline Diff */}
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto">
                  {item.diffSegments.map((seg, sIdx) => {
                    if (seg.type === 'added') {
                      return (
                        <span key={sIdx} className="bg-emerald-100 text-emerald-900 font-semibold px-0.5 rounded">
                          {seg.text}{' '}
                        </span>
                      );
                    }
                    if (seg.type === 'removed') {
                      return (
                        <span key={sIdx} className="bg-rose-100 text-rose-800 line-through px-0.5 rounded">
                          {seg.text}{' '}
                        </span>
                      );
                    }
                    return <span key={sIdx} className="text-slate-700">{seg.text} </span>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
