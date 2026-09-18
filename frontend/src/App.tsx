import { useState } from 'react';
import { Shield, GitCompare, MessageSquare, FileBadge, CheckCircle } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { AuditTab } from './pages/AuditTab';
import { CompareTab } from './pages/CompareTab';
import { ChatTab } from './pages/ChatTab';
import { DossierTab } from './pages/DossierTab';
import { AuditResult, PersonaType, ReadingLevel } from './types';
import { SAMPLE_CONTRACTS } from './data/sampleContracts';

export function App() {
  const [activeTab, setActiveTab] = useState<'audit' | 'compare' | 'chat' | 'dossier'>('audit');
  const [persona, setPersona] = useState<PersonaType>('Freelancer');
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>('Standard');
  const [highContrast, setHighContrast] = useState(false);

  // Shared Document State
  const [rawText, setRawText] = useState<string>(SAMPLE_CONTRACTS[0]?.text || '');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const handleAuditComplete = (result: AuditResult, text: string) => {
    setAuditResult(result);
    setRawText(text);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 ${highContrast ? 'high-contrast' : ''}`}>
      {/* Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Navbar */}
      <Navbar
        currentPersona={persona}
        onPersonaChange={setPersona}
        readingLevel={readingLevel}
        onReadingLevelChange={setReadingLevel}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 space-x-1 sm:space-x-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>1. Audit & Gotchas</span>
            {auditResult && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'compare'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>2. Compare & Redline</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'chat'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>3. Grounded Legal Q&A</span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'dossier'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileBadge className="w-4 h-4" />
            <span>4. Attorney Dossier & Timeline</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'audit' && (
          <AuditTab
            currentPersona={persona}
            readingLevel={readingLevel}
            auditResult={auditResult}
            onAuditComplete={handleAuditComplete}
            rawText={rawText}
            setRawText={setRawText}
          />
        )}

        {activeTab === 'compare' && <CompareTab />}

        {activeTab === 'chat' && (
          <ChatTab
            documentText={rawText}
            onUpdateDocumentText={setRawText}
            activeDocumentName={auditResult?.fileName || 'Freelance Agreement (Aggressive)'}
            readingLevel={readingLevel}
          />
        )}

        {activeTab === 'dossier' && (
          <DossierTab
            documentText={rawText}
            documentTitle={auditResult?.fileName || 'Contract Legal Brief'}
            persona={persona}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 tracking-tight">LexTrace AI</span>
            <span>•</span>
            <span className="text-slate-600">Trace the clause. Understand the risk. Know what to ask.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Bank-Grade Pre-LLM PII Masking
            </span>
            <span className="hidden sm:inline">•</span>
            <span>40+ Legal Benchmark Standards</span>
            <span className="hidden sm:inline">•</span>
            <span>Zero-Retention Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
