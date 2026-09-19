import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Quote,
  Loader2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Bot,
  User,
  ExternalLink,
} from 'lucide-react';
import { ChatAnswer, ReadingLevel } from '../types';
import { SAMPLE_CONTRACTS, SampleContract } from '../data/sampleContracts';

interface ChatTabProps {
  documentText: string;
  onUpdateDocumentText?: (text: string) => void;
  activeDocumentName?: string;
  readingLevel: ReadingLevel;
  suggestedQuestions?: string[];
}

export const ChatTab: React.FC<ChatTabProps> = ({
  documentText,
  onUpdateDocumentText,
  activeDocumentName = 'Freelance Agreement (Aggressive)',
  readingLevel,
  suggestedQuestions = [
    'Can the client withhold my payments if they are unsatisfied?',
    'Who owns the code and intellectual property I write on weekends?',
    'Is my liability capped or completely unlimited?',
    'What are the notice requirements to terminate this agreement?',
  ],
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatAnswer[]>([]);
  const [selectedDocTitle, setSelectedDocTitle] = useState(activeDocumentName);

  // Switch sample contract directly inside Chat
  const handleSelectSample = (sample: SampleContract) => {
    if (onUpdateDocumentText) {
      onUpdateDocumentText(sample.text);
    }
    setSelectedDocTitle(sample.title);
    setErrorMessage(null);
  };

  const handleAsk = async (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : question).trim();
    if (!q) return;

    // Use current document or fallback to first sample contract if empty
    const textToQuery =
      documentText && documentText.trim().length > 10
        ? documentText
        : SAMPLE_CONTRACTS[0].text;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/documents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          documentText: textToQuery,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let errMsg = `Server returned status ${res.status}`;
        try {
          const parsed = JSON.parse(text);
          if (parsed.error?.message) errMsg = parsed.error.message;
        } catch {
          if (text && text.length > 0) errMsg = text.slice(0, 200);
        }
        setErrorMessage(errMsg);
        return;
      }

      const json = await res.json();
      if (json.success) {
        setHistory((prev) => [json.data, ...prev]);
        setQuestion('');
      } else {
        setErrorMessage(json.error?.message || 'Failed to get answer from AI engine.');
      }
    } catch (err) {
      setErrorMessage(`Connection error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-tr from-teal-700 to-teal-600 text-white rounded-xl shadow-md shadow-teal-900/10">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Grounded Legal Q&A Copilot
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  <Sparkles className="w-3 h-3 text-teal-600" /> Clause-Grounded
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ask any question about risks, gotchas, obligations, or this platform. Every answer is backed by exact clause citations.
              </p>
            </div>
          </div>
        </div>

        {/* Active Document Selector Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <FileText className="w-4 h-4 text-teal-700 shrink-0" />
            <span>Active Document:</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-xs">
              {selectedDocTitle}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({(documentText || SAMPLE_CONTRACTS[0].text).length.toLocaleString()} chars)
            </span>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-slate-400 font-semibold text-[11px]">Load Sample:</span>
            {SAMPLE_CONTRACTS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => handleSelectSample(sc)}
                className={`text-[11px] font-medium px-2 py-1 rounded-md border transition-all ${
                  selectedDocTitle === sc.title
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {sc.title.split(' ')[0]} {sc.persona}
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Suggested Quick Questions:
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleAsk(sq)}
                disabled={loading}
                className="text-xs text-left px-3 py-1.5 bg-slate-50 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 text-slate-700 rounded-lg border border-slate-200/90 transition-all disabled:opacity-50"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Question Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="mt-5 flex gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about the contract terms, or type 'HI' to learn about LexTrace AI..."
              className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-300/90 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Analyzing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Ask</span>
              </>
            )}
          </button>
        </form>

        {/* Error Notification Banner (No Browser alert) */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Answers Conversation Stream */}
      <div className="space-y-4">
        {/* Welcoming Greeting Message if history is empty */}
        {history.length === 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-700 to-slate-900 text-white rounded-xl shadow-xs shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">LexTrace AI Legal Assistant</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                    Ready
                  </span>
                </div>
                <p className="text-slate-700 font-medium">
                  Welcome! I am <strong>LexTrace AI</strong> (<em>"Trace the clause. Understand the risk. Know what to ask."</em>).
                </p>
                <p className="text-slate-600">
                  I can answer questions about your rights and obligations under the active contract, explain complex legal jargon in <strong>ELI5 Mode</strong>, or provide guidance on using our 40-benchmark risk audit, redline comparison, and attorney consultation dossier.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">Try asking:</span>
                  <button
                    onClick={() => handleAsk('HI')}
                    className="text-xs px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-md border border-teal-200 font-medium transition-colors"
                  >
                    👋 Say "HI"
                  </button>
                  <button
                    onClick={() => handleAsk('Can the client withhold payment if they are dissatisfied?')}
                    className="text-xs px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-md border border-teal-200 font-medium transition-colors"
                  >
                    💵 "Can client withhold pay?"
                  </button>
                  <button
                    onClick={() => handleAsk('Who owns code created on personal time?')}
                    className="text-xs px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-md border border-teal-200 font-medium transition-colors"
                  >
                    💻 "Who owns weekend code?"
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Thread */}
        {history.map((ans, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4 animate-in fade-in duration-200"
          >
            {/* User Question Bubble */}
            <div className="flex items-start justify-end gap-2.5">
              <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-xs max-w-xl text-xs sm:text-sm font-semibold">
                {ans.question}
              </div>
              <div className="p-1.5 bg-teal-100 text-teal-800 rounded-lg shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            </div>

            {/* AI Answer Bubble */}
            <div className="flex items-start gap-3 pt-2">
              <div className="p-2 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-teal-300 rounded-xl shadow-xs shrink-0 mt-0.5 border border-teal-500/20">
                <Bot className="w-5 h-5" />
              </div>

              <div className="flex-1 space-y-3">
                {/* AI Text with Reading Level Support */}
                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {readingLevel === 'ELI5' ? ans.eli5Answer : ans.answer}
                </div>

                {readingLevel === 'ELI5' && (
                  <div className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-md font-semibold">
                    👶 ELI5 Mode: Plain-English simplification for non-lawyers
                  </div>
                )}

                {/* Grounded Citations Box */}
                {ans.citations && ans.citations.length > 0 && (
                  <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/90 space-y-2.5 mt-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 text-teal-800">
                        <Quote className="w-3.5 h-3.5 text-teal-600" /> Grounded Document Citations
                      </span>
                      <span className="text-emerald-700 font-mono font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Confidence: {Math.round(ans.confidenceScore * 100)}%
                      </span>
                    </div>

                    {ans.citations.map((cite, cIdx) => (
                      <div
                        key={cIdx}
                        className="bg-white p-3 rounded-lg border border-slate-200/80 text-xs text-slate-600 space-y-1"
                      >
                        <div className="font-bold text-slate-800 flex items-center justify-between">
                          <span>
                            Clause #{cite.clauseIndex + 1} ({cite.clauseType})
                          </span>
                        </div>
                        <p className="font-mono text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 italic">
                          "{cite.excerpt}..."
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Follow-Ups */}
                {ans.suggestedFollowUps && ans.suggestedFollowUps.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400">Suggested Follow-Ups:</span>
                    {ans.suggestedFollowUps.map((fu, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleAsk(fu)}
                        disabled={loading}
                        className="text-[11px] text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-md border border-teal-200/90 transition-colors font-medium text-left"
                      >
                        {fu}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
