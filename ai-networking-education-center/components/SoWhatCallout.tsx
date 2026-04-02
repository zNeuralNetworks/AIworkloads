import React from 'react';

interface SoWhatCalloutProps {
  title?: string;
  body: string;
}

const SoWhatCallout: React.FC<SoWhatCalloutProps> = ({ title = 'So What?', body }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-900/15 to-violet-900/15 p-10 text-center">
      <h3 className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-white">{title}</h3>
      <p className="mx-auto max-w-4xl text-xl leading-relaxed text-slate-200 md:text-2xl">
        {body}
      </p>
    </div>
  );
};

export default SoWhatCallout;
