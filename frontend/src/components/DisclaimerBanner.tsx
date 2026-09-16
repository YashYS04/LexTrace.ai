import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="Legal Disclaimer"
      className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-amber-900 text-xs flex items-center justify-between"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-2 pr-4">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          <strong className="font-semibold">Legal Disclaimer:</strong> LexTrace AI provides automated informational document analysis and is not a law firm. This tool does not provide legal advice, nor does it create an attorney-client relationship. Always consult a licensed attorney before signing or executing binding legal agreements.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-700 hover:text-amber-950 p-1 rounded focus:ring-1 focus:ring-amber-500"
        aria-label="Dismiss disclaimer banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
