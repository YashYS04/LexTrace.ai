import React from 'react';
import { Eye, BookOpen, UserCheck } from 'lucide-react';
import { PersonaType, ReadingLevel } from '../types';
import { Logo } from './Logo';

interface NavbarProps {
  currentPersona: PersonaType;
  onPersonaChange: (persona: PersonaType) => void;
  readingLevel: ReadingLevel;
  onReadingLevelChange: (level: ReadingLevel) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPersona,
  onPersonaChange,
  readingLevel,
  onReadingLevelChange,
  highContrast,
  onToggleHighContrast,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between py-3 gap-3">
          {/* Logo & Status Indicator */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-4">
            <Logo size="md" />
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Neural Engine Active</span>
            </div>
          </div>

          {/* Controls: Persona, Reading Level, High Contrast */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Persona Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs">
              <span className="px-2 font-medium text-slate-500 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Persona:
              </span>
              {(['Freelancer', 'Tenant', 'Employee', 'SmallBusiness'] as PersonaType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => onPersonaChange(p)}
                  className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                    currentPersona === p
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  aria-pressed={currentPersona === p}
                >
                  {p === 'SmallBusiness' ? 'SMB' : p}
                </button>
              ))}
            </div>

            {/* Reading Level Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs">
              <span className="px-2 font-medium text-slate-500 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Level:
              </span>
              {(['ELI5', 'Standard', 'Legal'] as ReadingLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onReadingLevelChange(lvl)}
                  className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                    readingLevel === lvl
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  title={
                    lvl === 'ELI5'
                      ? 'Explain Like I’m 5 (Simple plain language)'
                      : lvl === 'Standard'
                      ? 'Standard plain English'
                      : 'Legal deep-dive'
                  }
                  aria-pressed={readingLevel === lvl}
                >
                  {lvl === 'ELI5' ? '👶 ELI5' : lvl}
                </button>
              ))}
            </div>

            {/* High Contrast Toggle */}
            <button
              onClick={onToggleHighContrast}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 font-semibold transition-colors ${
                highContrast
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Toggle High Contrast Accessibility Mode"
              aria-label="Toggle High Contrast Mode"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden md:inline">{highContrast ? 'Contrast ON' : 'Contrast'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
