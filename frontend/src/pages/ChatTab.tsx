import React, { useState } from 'react';
import { MessageSquare, Send, Quote, HelpCircle, Loader2 } from 'lucide-react';
import { ChatAnswer, ReadingLevel } from '../types';

interface ChatTabProps {
  documentText: string;
  readingLevel: ReadingLevel;
  suggestedQuestions?: string[];
}

export const ChatTab: React.FC<ChatTabProps> = ({
  documentText,
  readingLevel,
  suggestedQuestions = [
    'Can my landlord enter without 24-hour notice?',
    'What happens if client delays or withholds payment?',
    'Does the company own projects I build on weekends?',
    'What are the penalty fees if I terminate early?',
  ],
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatAnswer[]>([]);

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim()) return;

    if (!documentText || documentText.trim().length < 20) {
      alert('Please upload or audit a contract document first in the "Audit & Gotchas" tab.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/documents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          documentText,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setHistory((prev) => [json.data, ...prev]);
        setQuestion('');
      } else {
        alert(`Failed to get answer: ${json.error?.message}`);
      }
    } catch (err) {
      alert(`Network error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro & Prompt Suggestions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Grounded Contract Q&A Copilot</h2>
            <p className="text-xs text-slate-500">
              Ask any question about obligations, deadlines, or risks. Answers are grounded with verified citations.
            </p>
          </div>
        </div>

        {/* Suggested Question Chips */}
        <div className="mt-4">
          <span className="text-xs font-semibold text-slate-400 block mb-2">Suggested Quick Questions:</span>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleAsk(sq)}
                disabled={loading}
                className="text-xs text-left px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-lg border border-slate-200 transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="mt-5 flex gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about this contract (e.g. 'What is the late fee policy?')..."
            className="flex-1 text-xs px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Ask</span>
          </button>
        </form>
      </div>

      {/* Answers Stream */}
      <div className="space-y-4">
        {history.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-slate-700">No Questions Asked Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Select one of the suggested chips above or type a specific question about clauses, notice periods, or payment terms.
            </p>
          </div>
        )}

        {history.map((ans, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">
            {/* User Question */}
            <div className="flex items-start gap-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
              <span className="p-1 bg-slate-100 text-slate-600 rounded">Q:</span>
              <span>{ans.question}</span>
            </div>

            {/* AI Answer with Reading Level Support */}
            <div className="text-xs text-slate-700 leading-relaxed space-y-2">
              <p className="text-slate-800 font-medium text-sm">
                {readingLevel === 'ELI5' ? ans.eli5Answer : ans.answer}
              </p>
              {readingLevel === 'ELI5' && (
                <span className="inline-block text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
                  👶 ELI5 Mode active: Simplified for non-lawyers
                </span>
              )}
            </div>

            {/* Citations Box */}
            {ans.citations && ans.citations.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Quote className="w-3.5 h-3.5 text-teal-600" /> Verified Document Citations
                  </span>
                  <span className="text-teal-700 font-mono">
                    Grounded Confidence: {Math.round(ans.confidenceScore * 100)}%
                  </span>
                </div>

                {ans.citations.map((cite, cIdx) => (
                  <div key={cIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-600">
                    <div className="font-bold text-slate-800 mb-0.5">
                      Clause #{cite.clauseIndex + 1} ({cite.clauseType})
                    </div>
                    <p className="font-mono text-[11px] text-slate-600 italic">
                      "{cite.excerpt}..."
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Follow-Ups */}
            {ans.suggestedFollowUps && ans.suggestedFollowUps.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">Related Questions:</span>
                {ans.suggestedFollowUps.map((fu, fIdx) => (
                  <button
                    key={fIdx}
                    onClick={() => handleAsk(fu)}
                    className="text-[11px] text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-md border border-teal-200 transition-colors"
                  >
                    {fu}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
