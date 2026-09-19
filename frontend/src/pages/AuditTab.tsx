import React, { useState } from 'react';
import { UploadCloud, Filter, CheckCircle2, AlertTriangle, XCircle, Sparkles, Loader2 } from 'lucide-react';
import { AuditResult, PersonaType, ReadingLevel, RiskLevel, ScoredClause } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';
import { GotchasCard } from '../components/GotchasCard';
import { CounterDraftModal } from '../components/CounterDraftModal';
import { SAMPLE_CONTRACTS } from '../data/sampleContracts';

interface AuditTabProps {
  currentPersona: PersonaType;
  readingLevel: ReadingLevel;
  auditResult: AuditResult | null;
  onAuditComplete: (result: AuditResult, rawText: string) => void;
  rawText: string;
  setRawText: (text: string) => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  currentPersona,
  readingLevel,
  auditResult,
  onAuditComplete,
  rawText,
  setRawText,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'All' | RiskLevel>('All');
  const [activeCounterDraftClause, setActiveCounterDraftClause] = useState<ScoredClause | null>(null);
  const [expandedClauses, setExpandedClauses] = useState<Set<number>>(new Set([0, 1]));

  const handleRunAudit = async (textToAudit?: string, title?: string) => {
    const text = textToAudit || rawText;
    if (!text || text.trim().length < 20) {
      alert('Please enter or upload a legal contract with at least 20 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/documents/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          fileName: title || 'Uploaded_Contract.txt',
          persona: currentPersona,
        }),
      });

      if (!response.ok) {
        const textResp = await response.text();
        let errMsg = `Server returned status ${response.status}`;
        try {
          const parsed = JSON.parse(textResp);
          if (parsed.error?.message) errMsg = parsed.error.message;
        } catch {
          if (textResp && textResp.length > 0) errMsg = textResp.slice(0, 200);
        }
        alert(`Audit error: ${errMsg}`);
        return;
      }

      const json = await response.json();
      if (json.success) {
        onAuditComplete(json.data, text);
      } else {
        alert(`Audit failed: ${json.error?.message || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Network error during audit: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setRawText(data.data.text);
        handleRunAudit(data.data.text, file.name);
      } else {
        alert(`Upload failed: ${data.error?.message}`);
      }
    } catch (err) {
      alert(`Upload error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sampleId: string) => {
    const sample = SAMPLE_CONTRACTS.find((s) => s.id === sampleId);
    if (sample) {
      setRawText(sample.text);
      handleRunAudit(sample.text, sample.title);
    }
  };

  const toggleClauseExpand = (index: number) => {
    setExpandedClauses((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const jumpToClause = (index: number) => {
    setExpandedClauses((prev) => new Set([...prev, index]));
    const element = document.getElementById(`clause-card-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const filteredClauses = auditResult
    ? auditResult.clauses.filter((c) =>
        selectedRiskFilter === 'All' ? true : c.riskLevel === selectedRiskFilter
      )
    : [];

  return (
    <div className="space-y-8">
      {/* Upload & Sample Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Input Contract Document</h2>
            <p className="text-xs text-slate-500">
              Paste contract text, upload a document, or load a pre-configured scenario.
            </p>
          </div>

          {/* Quick Demo Preloaders */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Load Scenario:</span>
            {SAMPLE_CONTRACTS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => loadSample(sample.id)}
                disabled={loading}
                className="text-xs font-medium px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-md border border-slate-200 transition-colors"
              >
                {sample.title.split(' ')[0]} ({sample.persona})
              </button>
            ))}
          </div>
        </div>

        {/* Text Area Input */}
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste full agreement text here (or drag and drop a file below)..."
          rows={5}
          className="w-full text-xs font-mono p-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
        />

        {/* Action Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300">
            <UploadCloud className="w-4 h-4 text-slate-600" />
            <span>Upload .txt or .pdf</span>
            <input
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => handleRunAudit()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing against 40+ market benchmarks...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-teal-200" />
                <span>Run Complete Contract Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audit Output View */}
      {auditResult && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Health Score Gauge */}
          <ScoreGauge score={auditResult.overallHealthScore} riskSummary={auditResult.riskSummary} />

          {/* "Before You Sign" Gotchas */}
          <GotchasCard
            gotchas={auditResult.gotchas}
            readingLevel={readingLevel}
            onSelectClause={jumpToClause}
          />

          {/* Clause Explorer Section */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Clause-by-Clause Risk Breakdown</h3>
                <p className="text-xs text-slate-500">
                  {filteredClauses.length} of {auditResult.clauses.length} clauses shown. Evaluated against market-standard benchmarks.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-500 ml-1 mr-0.5" />
                {(['All', RiskLevel.Unfavorable, RiskLevel.Caution, RiskLevel.Standard] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedRiskFilter(filter)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      selectedRiskFilter === filter
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Clauses List */}
            <div className="mt-6 space-y-4">
              {filteredClauses.map((clause) => {
                const isExpanded = expandedClauses.has(clause.clauseIndex);
                return (
                  <div
                    key={clause.clauseIndex}
                    id={`clause-card-${clause.clauseIndex}`}
                    className={`rounded-xl border transition-all ${
                      clause.riskLevel === RiskLevel.Unfavorable
                        ? 'border-rose-200 bg-rose-50/20'
                        : clause.riskLevel === RiskLevel.Caution
                        ? 'border-amber-200 bg-amber-50/20'
                        : 'border-emerald-200 bg-emerald-50/10'
                    }`}
                  >
                    {/* Clause Header Bar */}
                    <div
                      onClick={() => toggleClauseExpand(clause.clauseIndex)}
                      className="p-4 cursor-pointer flex items-center justify-between gap-4 select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400">
                          #{clause.clauseIndex + 1}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">
                          {clause.clauseType}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            clause.riskLevel === RiskLevel.Unfavorable
                              ? 'bg-rose-100 text-rose-800'
                              : clause.riskLevel === RiskLevel.Caution
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {clause.riskLevel === RiskLevel.Unfavorable && <XCircle className="w-3.5 h-3.5" />}
                          {clause.riskLevel === RiskLevel.Caution && <AlertTriangle className="w-3.5 h-3.5" />}
                          {clause.riskLevel === RiskLevel.Standard && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {clause.riskLevel}
                        </span>

                        <span className="text-xs text-slate-400 font-mono">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Clause Body */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100/80 space-y-3">
                        {/* Risk Explanation */}
                        <div className="p-3 bg-white rounded-lg border border-slate-200/80 text-xs">
                          <span className="font-bold text-slate-700 block mb-1">
                            {readingLevel === 'ELI5' ? '👶 Simple Breakdown:' : 'Analysis & Variance:'}
                          </span>
                          <p className="text-slate-600 leading-relaxed">
                            {readingLevel === 'ELI5' ? clause.eli5Explanation : clause.explanation}
                          </p>
                        </div>

                        {/* Raw Clause Text */}
                        <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 leading-relaxed border border-slate-200">
                          {clause.clauseText}
                        </div>

                        {/* Benchmark Comparison & Counter-Draft Action */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <span className="text-[11px] text-slate-400 italic">
                            Matched Benchmark: {clause.matchedBenchmarkId || 'Market Standard Baseline'}
                          </span>

                          {clause.counterDraft && (
                            <button
                              onClick={() => setActiveCounterDraftClause(clause)}
                              className="text-xs font-bold px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                              <span>View Fair Counter-Draft</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Counter-Draft Modal */}
      <CounterDraftModal
        clause={activeCounterDraftClause}
        onClose={() => setActiveCounterDraftClause(null)}
      />
    </div>
  );
};
