import React from 'react';

interface PatternDecoderProps {
  title?: string;
  intro?: string;
  shape: string;
  concentration: string;
  posture: string;
  failure: string;
}

const PatternDecoder: React.FC<PatternDecoderProps> = ({
  title = 'Read The Pattern In Four Questions',
  intro = 'This decoder turns a traffic pattern into a usable diagnosis instead of another block of prose.',
  shape,
  concentration,
  posture,
  failure,
}) => (
  <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6 md:p-8">
    <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">
      Pattern Decoder
    </div>
    <h3 className="mb-3 text-2xl font-bold text-white">{title}</h3>
    <p className="mb-6 max-w-3xl text-sm leading-relaxed text-slate-400">{intro}</p>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DecoderCard index="1" question="What shape is the traffic?" answer={shape} />
      <DecoderCard index="2" question="Where does pressure concentrate?" answer={concentration} />
      <DecoderCard index="3" question="What posture should the fabric take?" answer={posture} />
      <DecoderCard index="4" question="What fails first if you miss it?" answer={failure} />
    </div>
  </div>
);

const DecoderCard: React.FC<{ index: string; question: string; answer: string }> = ({
  index,
  question,
  answer,
}) => (
  <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-5">
    <div className="mb-3 flex items-center gap-3">
      <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-mono text-blue-300">
        Step {index}
      </div>
      <div className="text-sm font-semibold text-white">{question}</div>
    </div>
    <p className="text-sm leading-relaxed text-slate-300">{answer}</p>
  </div>
);

export default PatternDecoder;
