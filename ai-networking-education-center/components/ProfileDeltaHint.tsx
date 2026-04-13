import React from 'react';

interface ProfileDeltaHintProps {
  changedLabel?: string;
  changedValue?: string;
  activeProfileTitle: string;
  explanation: string;
}

const ProfileDeltaHint: React.FC<ProfileDeltaHintProps> = ({
  changedLabel,
  changedValue,
  activeProfileTitle,
  explanation,
}) => (
  <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
    <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-violet-300">
      Why this changed
    </div>
    <p className="text-sm leading-relaxed text-violet-100">
      {changedLabel && changedValue ? (
        <>
          Changing <span className="font-semibold text-white">{changedLabel}</span> to{' '}
          <span className="font-semibold text-white">{changedValue}</span> pulls the classifier toward{' '}
          <span className="font-semibold text-white">{activeProfileTitle}</span>. {explanation}
        </>
      ) : (
        explanation
      )}
    </p>
  </div>
);

export default ProfileDeltaHint;
