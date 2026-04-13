import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CompactDisclosureProps {
  eyebrow?: string;
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const CompactDisclosure: React.FC<CompactDisclosureProps> = ({
  eyebrow = 'Show reasoning',
  title,
  summary,
  defaultOpen = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#161b22]">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/3"
      >
        <div>
          <div className="mb-1 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
            {eyebrow}
          </div>
          <div className="text-sm font-semibold text-white">{title}</div>
          {summary ? <p className="mt-1 text-sm leading-relaxed text-slate-400">{summary}</p> : null}
        </div>
        <div className="shrink-0 pt-1 text-slate-500">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {isOpen ? <div className="border-t border-white/5 px-5 py-4">{children}</div> : null}
    </div>
  );
};

export default CompactDisclosure;
