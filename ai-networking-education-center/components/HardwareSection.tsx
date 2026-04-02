import React, { useState, useEffect, ReactNode } from 'react';
import { useData } from '../contexts/DataContext';
import { ChevronRight, Info, Server, ExternalLink } from 'lucide-react';
import { ICON_MAP, PLANNER_HANDOFF_LABEL, PLANNER_HANDOFF_STANDARD_TEXT } from '../constants';
import GlossaryTerm from './GlossaryTerm';
import InfrastructureImplicationsPanel from './InfrastructureImplicationsPanel';
import RunbookLinksPanel from './RunbookLinksPanel';
import SoWhatCallout from './SoWhatCallout';
import SourceBadge from './SourceBadge';
import TelemetryWatchPanel from './TelemetryWatchPanel';
import { claimText, hasSourceMetadata } from '../utils/sourceClaims';
import type { InfrastructureImplication, RunbookReference, TelemetryWatchpoint } from '../types';

// Helper component to parse text and auto-wrap known glossary terms
// This ensures that even dynamic content from the admin panel gets tooltips.
const DescriptionRenderer: React.FC<{ text: string }> = ({ text }) => {
  // List of high-value terms to auto-highlight in this specific section
  const termsToHighlight = [
    'Radix',
    'VOQ',
    'LPO',
    'Deep Buffers',
    'Tomahawk',
    'Jericho',
    'PCIe',
    'Fabric',
    'Leaf',
    'Spine',
    'CLOS',
  ];

  // Create a regex that finds these words (case insensitive, whole word)
  const regex = new RegExp(`\\b(${termsToHighlight.join('|')})\\b`, 'gi');

  const parts = text.split(regex);

  return (
    <p className="text-slate-300 leading-relaxed text-sm">
      {parts.map((part, i) => {
        // Check if this part matches one of our terms (case insensitive)
        const match = termsToHighlight.find((t) => t.toLowerCase() === part.toLowerCase());
        if (match) {
          return (
            <GlossaryTerm key={i} term={match}>
              {part}
            </GlossaryTerm>
          );
        }
        return part;
      })}
    </p>
  );
};

interface ProductTip {
  title: string;
  body: ReactNode;
}

const PRODUCT_TIPS: Record<string, ProductTip> = {
  '7060X': {
    title: 'Why LPO?',
    body: (
      <>
        <GlossaryTerm term="LPO">Linear Pluggable Optics</GlossaryTerm> remove the DSP from
        transceiver modules, cutting power per port by up to 15%. On a 64-port 800G leaf, that
        adds up to kilowatts of savings at the rack level.
      </>
    ),
  },
  '7800R': {
    title: 'Why VOQ?',
    body: (
      <>
        <GlossaryTerm term="VOQ">Virtual Output Queuing</GlossaryTerm> eliminates{' '}
        <GlossaryTerm term="Head-of-Line Blocking">head-of-line blocking</GlossaryTerm> by
        buffering packets at ingress sorted by destination. Essential for{' '}
        <GlossaryTerm term="Incast">incast</GlossaryTerm>-heavy AI collectives.
      </>
    ),
  },
  '7700R': {
    title: 'Why Single Hop?',
    body: (
      <>
        Single-hop removes the spine tier entirely. Any GPU can reach any other GPU in one switch
        traversal — minimizing{' '}
        <GlossaryTerm term="Tail Latency">tail latency</GlossaryTerm> and simplifying fabric
        management at ultra-large scale.
      </>
    ),
  },
  '7280R3': {
    title: 'Why Deep Buffers?',
    body: (
      <>
        AI traffic consists of "<GlossaryTerm term="Incast">incast</GlossaryTerm>" bursts.
        Shallow buffer switches drop packets during these microbursts.{' '}
        <GlossaryTerm term="Deep Buffers">Deep buffers</GlossaryTerm> (
        <GlossaryTerm term="VOQ">VOQ</GlossaryTerm>) absorb them.
      </>
    ),
  },
  '7280R3A': {
    title: 'Why In-Band Telemetry?',
    body: (
      <>
        In-Band Network Telemetry embeds timing and queue-depth metadata into live data packets.
        This gives per-flow, per-hop visibility without dedicated probes — critical for diagnosing{' '}
        <GlossaryTerm term="Microburst">microburst</GlossaryTerm> events in AI storage fabrics.
      </>
    ),
  },
};

const PLATFORM_DECISION_CONTENT: Record<
  string,
  {
    bestFit: string;
    tradeoffs: string[];
    operationalConsequence: string;
    whatLeadsHere: string;
    telemetry: TelemetryWatchpoint[];
    runbooks: RunbookReference[];
  }
> = {
  '7060X': {
    bestFit: 'High-radix fixed fabrics where dense 800G connectivity and low-latency collective posture matter more than deep-buffer absorption.',
    tradeoffs: [
      'Excellent when collective symmetry is the main architecture requirement',
      'Less forgiving when receiver convergence or storage bursts dominate',
      'Rewards disciplined pathing more than it forgives queue mistakes',
    ],
    operationalConsequence: 'The platform works best when the architecture is already clean. If congestion posture is weak, the fabric will show it quickly.',
    whatLeadsHere: 'Choose this when synchronized collectives dominate and the main question is dense non-blocking connectivity rather than deep queue headroom.',
    telemetry: [
      { label: 'Rail balance', signal: 'Slowest rail, path spread, and collective tail latency', whyItMatters: 'These prove whether the fixed high-radix backend is really delivering symmetry.' },
      { label: 'Queue discipline', signal: 'ECN-to-PFC sequence under burst coordination', whyItMatters: 'This tells you whether the platform is being used with the right congestion posture.' },
    ],
    runbooks: [
      { id: 'allreduce-tail-latency', label: 'High Tail Latency During All-Reduce', context: 'Use this when the fixed backend is still being stretched by one hot rail or path.' },
      { id: 'ecn-instability', label: 'ECN Mark Rate Instability', context: 'Use this when pathing is acceptable but the feedback loop is still wrong.' },
    ],
  },
  '7800R': {
    bestFit: 'Large-scale modular spines where VOQ fairness, deep buffers, and expansion discipline matter more than a purely fixed-form-factor story.',
    tradeoffs: [
      'Stronger fit for convergent pressure and modular scale growth',
      'Operationally heavier than a fixed spine story',
      'Best when fairness under burst fan-in is architecturally important',
    ],
    operationalConsequence: 'This shifts the decision from simple port density to queue fairness, scale boundaries, and modular operational discipline.',
    whatLeadsHere: 'Choose this when large-scale spine growth, receiver convergence, or modular fairness is the real architecture constraint.',
    telemetry: [
      { label: 'Receiver fairness', signal: 'Destination-facing queue growth stays bounded under fan-in', whyItMatters: 'This proves whether VOQ and deeper buffering are solving the intended problem.' },
      { label: 'Growth posture', signal: 'Expansion or modular growth does not create new hot boundaries', whyItMatters: 'A modular spine is only valuable if it scales cleanly.' },
    ],
    runbooks: [
      { id: 'incast-collapse', label: 'Throughput Collapse During Incast', context: 'Use this when deep-buffer and VOQ assumptions are not actually protecting convergent workloads.' },
      { id: 'allreduce-tail-latency', label: 'High Tail Latency During All-Reduce', context: 'Use this when scale is large but one path or linecard domain still stretches completion.' },
    ],
  },
  '7700R': {
    bestFit: 'Very large environments where single-hop simplification and distributed scale are more valuable than preserving a conventional staged topology.',
    tradeoffs: [
      'Powerful scale simplification story at very large size',
      'A different operational model than conventional Clos growth',
      'Best when scale really justifies the topology shift',
    ],
    operationalConsequence: 'This changes the topology conversation itself. The main risk is adopting the distributed model before the scale and workload assumptions truly require it.',
    whatLeadsHere: 'Choose this when the architecture problem is now topology simplification at massive scale, not just adding more stages to a smaller fabric.',
    telemetry: [
      { label: 'Global consistency', signal: 'Cluster-wide tail behavior stays bounded instead of moving the bottleneck elsewhere', whyItMatters: 'The single-hop story only matters if it removes rather than relocates the problem.' },
      { label: 'Failure-domain behavior', signal: 'Large-scale disruption remains bounded during fault or maintenance events', whyItMatters: 'Topology simplification must still preserve predictable resilience.' },
    ],
    runbooks: [
      { id: 'allreduce-tail-latency', label: 'High Tail Latency During All-Reduce', context: 'Use this when distributed scale still leaves a global hot path or straggler domain.' },
      { id: 'ecn-instability', label: 'ECN Mark Rate Instability', context: 'Use this when topology is right but the control loop is still wrong.' },
    ],
  },
  '7280R3': {
    bestFit: 'Storage-heavy or convergent environments where deep buffering and VOQ matter more than pure radix density.',
    tradeoffs: [
      'Excellent for storage bursts and receiver convergence',
      'Not the default answer for every collective-heavy backend',
      'Deep buffers help only when the workload really needs them',
    ],
    operationalConsequence: 'The main value is surviving storage and microburst behavior. The main risk is using deep buffers as a substitute for disciplined architecture everywhere else.',
    whatLeadsHere: 'Choose this when checkpoint, storage, or convergent fan-in is the dominant operational risk.',
    telemetry: [
      { label: 'Burst absorption', signal: 'Checkpoint and ingest pressure stay bounded instead of spreading pause or HOL blocking', whyItMatters: 'This validates the reason for choosing a deeper-buffer platform.' },
      { label: 'Queue fairness', signal: 'Convergent receivers remain stable under burst fan-in', whyItMatters: 'This shows whether the platform is protecting the right boundary.' },
    ],
    runbooks: [
      { id: 'incast-collapse', label: 'Throughput Collapse During Incast', context: 'Use this when storage or fan-in pressure still collapses throughput.' },
      { id: 'pfc-storm', label: 'PFC Storm / Head-of-Line Blocking', context: 'Use this when deep buffers still allow pause or HOL spread.' },
    ],
  },
  '7280R3A': {
    bestFit: 'Microburst-sensitive environments where in-band visibility is part of the architecture requirement, not just a nice extra.',
    tradeoffs: [
      'Better observability into burst and queue behavior',
      'Still requires disciplined interpretation of the telemetry',
      'Best when diagnosis speed is part of the value proposition',
    ],
    operationalConsequence: 'The platform helps only if the team turns that visibility into faster and better tuning decisions rather than collecting more counters.',
    whatLeadsHere: 'Choose this when the architecture question includes how to observe burst behavior clearly enough to keep up with tuning and incident response.',
    telemetry: [
      { label: 'Burst localization', signal: 'Per-hop queue and timing metadata isolate the hotspot quickly', whyItMatters: 'This proves the observability value is real rather than theoretical.' },
      { label: 'Lifecycle clarity', signal: 'Writeback and recovery paths can be separated cleanly in telemetry', whyItMatters: 'This helps distinguish which workload stage is actually dominating.' },
    ],
    runbooks: [
      { id: 'incast-collapse', label: 'Throughput Collapse During Incast', context: 'Use this when telemetry makes the receiver-convergence problem obvious.' },
      { id: 'ecn-instability', label: 'ECN Mark Rate Instability', context: 'Use this when visibility shows the feedback loop is arriving too late.' },
    ],
  },
};

const PLATFORM_IMPLICATIONS: InfrastructureImplication[] = [
  {
    label: 'What leads you here',
    detail: 'Choose the platform after the workload, traffic geometry, and failure signature are clear. Do not start with a SKU and work backward into architecture.',
  },
  {
    label: 'What to tune first',
    detail: 'Tune pathing, queue boundaries, and failure-domain assumptions before escalating to a bigger or more specialized platform story.',
  },
  {
    label: 'When to hand off',
    detail: 'Once the platform posture is clear, use planner tooling for the quantitative BOM, optics, and exact tier-count decision.',
  },
];

const HardwareSection: React.FC = () => {
  const { products } = useData();
  const [activeProduct, setActiveProduct] = useState(products[0]);
  const [panelVisible, setPanelVisible] = useState(true);

  // Update active product if data changes (e.g. from Admin edit)
  useEffect(() => {
    if (products.length === 0) return;

    setActiveProduct((currentActiveProduct) => {
      if (!currentActiveProduct) {
        return products[0];
      }

      const matchingProduct = products.find((product) => product.id === currentActiveProduct.id);
      return matchingProduct || products[0];
    });
  }, [products]);

  // Fade the spec sheet when switching products
  useEffect(() => {
    setPanelVisible(false);
    const t = setTimeout(() => setPanelVisible(true), 50);
    return () => clearTimeout(t);
  }, [activeProduct?.id]);

  if (!activeProduct) return null;

  const ProductIcon = ICON_MAP[activeProduct.iconKey] || Server;
  const tip = PRODUCT_TIPS[activeProduct.id];
  const platformDecision = PLATFORM_DECISION_CONTENT[activeProduct.id] || PLATFORM_DECISION_CONTENT['7060X'];

  return (
    <section id="hardware" className="py-32 bg-[#0F1117] border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <div className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-4">
            Domain · Platform Considerations
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Platform Considerations
          </h2>
          <p className="text-slate-400 max-w-2xl text-lg">
            Platform choice follows workload behavior. This module explains when radix, deep buffers, VOQ, modular scale, and observability become the next real architecture question.
          </p>
        </div>

        <div className="mb-12 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">
              Why This Matters
            </div>
            <h3 className="mb-4 text-2xl font-bold text-white">Platform follows workload posture</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              The right question is not which switch sounds best in isolation. The right question is what workload behavior makes radix, buffering, modularity, or optics efficiency the next meaningful constraint.
            </p>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
              <div className="mb-1 font-semibold">Common mistake</div>
              Teams compare platforms like brochures instead of translating the workload and failure signature into a platform tradeoff.
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#161b22] p-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-300">When deep buffers matter</div>
              <p className="text-sm leading-relaxed text-slate-300">When storage bursts, fan-in, and checkpoint convergence dominate the failure signature.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#161b22] p-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-300">When high radix matters</div>
              <p className="text-sm leading-relaxed text-slate-300">When synchronized collectives and dense non-blocking connectivity are the primary architectural requirement.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#161b22] p-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-300">When modular scale matters</div>
              <p className="text-sm leading-relaxed text-slate-300">When spine growth, fairness under scale, or expansion constraints are the dominant architecture problem.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#161b22] p-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-300">What should lead you here</div>
              <p className="text-sm leading-relaxed text-slate-300">A concrete workload or failure signature, not generic curiosity about product families.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
          {/* Sidebar Selector - Dev Tools Style */}
          <div className="lg:w-80 flex flex-col gap-2 shrink-0">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 px-2">
              Select Platform
            </div>
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => setActiveProduct(product)}
                className={`text-left p-4 rounded-lg border transition-all duration-200 group relative overflow-hidden ${
                  activeProduct.id === product.id
                    ? 'bg-blue-950/30 border-blue-500/50 text-white'
                    : 'bg-[#161b22] border-white/5 text-slate-400 hover:border-slate-600'
                }`}
                aria-pressed={activeProduct.id === product.id}
              >
                {activeProduct.id === product.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                )}
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold font-mono tracking-tight">{product.series}</span>
                  {activeProduct.id === product.id && (
                    <ChevronRight size={14} className="text-blue-400" />
                  )}
                </div>
                <div className="text-xs opacity-70 truncate">{product.role}</div>
              </button>
            ))}

            {/* Contextual Info Card */}
            <div className="mt-8 p-4 bg-[#161b22] border border-white/5 rounded-lg">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Info size={14} />
                <span className="text-xs font-bold uppercase">
                  {tip ? tip.title : 'Platform Note'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {tip ? tip.body : activeProduct.role}
              </p>
            </div>
          </div>

          {/* Main Spec Sheet Display */}
          <div
            className={`flex-1 bg-[#161b22] rounded-2xl border border-white/5 p-8 relative overflow-hidden flex flex-col transition-opacity duration-200 ${panelVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-8 mb-8 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/10 rounded text-blue-400">
                    <ProductIcon size={24} />
                  </div>
                  <h3 className="text-3xl font-bold text-white">{activeProduct.series}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-blue-500 font-mono text-sm">{activeProduct.role}</div>
                  {activeProduct.scale && (
                    <>
                      <span className="text-slate-700">·</span>
                      <span className="text-slate-500 font-mono text-xs">
                        {activeProduct.scale}
                      </span>
                    </>
                  )}
                </div>
              </div>
            <div className="flex flex-wrap gap-2">
                {activeProduct.specs.map((spec, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1 bg-[#0d1117] border border-white/10 rounded text-xs text-slate-300 font-mono"
                    data-claim-id={hasSourceMetadata(spec) ? spec.claimId : undefined}
                  >
                    <span>{claimText(spec)}</span>
                    {hasSourceMetadata(spec) && <SourceBadge claim={spec} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-5">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-blue-300">
                  Best fit
                </div>
                <p className="text-sm leading-relaxed text-slate-300">{platformDecision.bestFit}</p>
                <div className="mt-4 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                  What leads you here
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{platformDecision.whatLeadsHere}</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-5">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-300">
                  Operational consequence
                </div>
                <p className="text-sm leading-relaxed text-slate-300">{platformDecision.operationalConsequence}</p>
                <div className="mt-4 text-[11px] font-mono uppercase tracking-[0.18em] text-blue-300">
                  {PLANNER_HANDOFF_LABEL}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{PLANNER_HANDOFF_STANDARD_TEXT}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left: Specs & Features */}
              <div className="space-y-8">
                <div>
                  <h4 className="text-slate-500 font-mono text-xs uppercase tracking-wider mb-4">
                    Description
                  </h4>
                  {/* Use the new renderer instead of raw string */}
                  <div
                    className="flex flex-wrap items-start gap-2"
                    data-claim-id={
                      hasSourceMetadata(activeProduct.desc) ? activeProduct.desc.claimId : undefined
                    }
                  >
                    <DescriptionRenderer text={claimText(activeProduct.desc)} />
                    {hasSourceMetadata(activeProduct.desc) && (
                      <SourceBadge claim={activeProduct.desc} />
                    )}
                  </div>

                  {/* Datasheet Link */}
                  {activeProduct.datasheetUrl && (
                    <a
                      href={activeProduct.datasheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-950/20 border border-blue-500/20 rounded hover:bg-blue-900/30 hover:border-blue-500/40 transition-colors text-blue-400 text-xs font-bold font-mono uppercase tracking-wide group"
                    >
                      <ExternalLink
                        size={14}
                        className="group-hover:scale-110 transition-transform"
                      />{' '}
                      View Datasheet
                    </a>
                  )}
                </div>

                {/* Key Features Metric Cards */}
                {activeProduct.keyFeatures && activeProduct.keyFeatures.length > 0 && (
                  <div>
                    <h4 className="text-slate-500 font-mono text-xs uppercase tracking-wider mb-4">
                      Key Features
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {activeProduct.keyFeatures.map((feature, i) => {
                        const FeatureIcon = feature.iconKey ? ICON_MAP[feature.iconKey] : null;
                        return (
                          <div
                            key={i}
                            className="bg-[#0d1117] border border-white/5 border-t-2 border-t-blue-500/30 rounded-lg p-3"
                          >
                            {FeatureIcon && (
                              <FeatureIcon size={14} className="text-blue-400 mb-2" />
                            )}
                            <div className="text-xs text-slate-500 font-mono mb-1">
                              {feature.label}
                            </div>
                            <div className="text-sm font-bold text-white font-mono">
                              {claimText(feature.value)}
                            </div>
                            <div className="text-xs text-slate-600 mt-1 leading-tight">
                              {claimText(feature.subtext)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeProduct.variants && (
                  <div>
                    <h4 className="text-slate-500 font-mono text-xs uppercase tracking-wider mb-4">
                      Configuration Variants
                    </h4>
                    <div className="space-y-2">
                      {activeProduct.variants.map((v, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-[#0d1117] border border-white/5 rounded hover:border-blue-500/30 transition-colors"
                        >
                          <span className="text-blue-100 font-mono text-xs font-bold">
                            {v.name}
                          </span>
                          <div className="flex gap-4 text-xs text-slate-500 font-mono">
                            <span>{v.chip}</span>
                            <span className="w-px h-4 bg-slate-800"></span>
                            <span
                              data-claim-id={
                                hasSourceMetadata(v.ports) ? v.ports.claimId : undefined
                              }
                            >
                              {claimText(v.ports)}
                            </span>
                            <span className="w-px h-4 bg-slate-800"></span>
                            <span className="text-slate-600">{v.formFactor}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Visual Rack Representation */}
              <div
                className="bg-[#0d1117] rounded-xl border border-white/5 p-6 flex flex-col items-center justify-center min-h-[300px] relative"
                role="img"
                aria-label={`Physical topology view of ${activeProduct.series}. Shows ${activeProduct.id === '7800R' ? 'modular linecards and fabric modules' : 'fixed switch ports'} status.`}
              >
                <div className="absolute top-4 left-4 text-xs font-mono text-slate-600 uppercase">
                  Physical Topology View
                </div>

                {/* CSS Rack Drawing */}
                <div className="relative w-48">
                  {/* Rack Frame */}
                  <div className="border-x-2 border-slate-700 h-64 w-full flex flex-col justify-end p-1 relative">
                    {/* Device Drawing */}
                    {activeProduct.id === '7800R' ? (
                      <div className="w-full h-56 bg-[#1e293b] border border-slate-600 rounded-sm relative flex flex-col">
                        {/* Modular Slots */}
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 border-b border-slate-700 w-full flex items-center px-1 gap-1"
                          >
                            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                            <div className="h-1 w-full bg-slate-800 rounded-full"></div>
                          </div>
                        ))}
                        <div className="absolute -right-12 top-10 text-xs text-blue-400 font-mono">
                          ← Linecards
                        </div>
                        <div className="absolute -left-16 bottom-4 text-xs text-blue-400 font-mono">
                          Fabric →
                        </div>
                      </div>
                    ) : activeProduct.id === '7700R' ? (
                      <div className="space-y-2 w-full">
                        <div className="w-full h-8 bg-[#1e293b] border border-slate-600 rounded-sm flex items-center justify-center text-[8px] text-slate-500">
                          Leaf 1
                        </div>
                        <div className="w-full h-12 border-2 border-dashed border-blue-900 rounded bg-blue-900/10 flex items-center justify-center text-[10px] text-blue-400 font-mono">
                          Distributed Fabric
                        </div>
                        <div className="w-full h-8 bg-[#1e293b] border border-slate-600 rounded-sm flex items-center justify-center text-[8px] text-slate-500">
                          Leaf 2
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-8 bg-[#1e293b] border border-slate-600 rounded-sm flex items-center px-2 gap-2 shadow-[0_0_15px_rgba(59,130,246,0.12)]">
                        <div className="flex-1 flex gap-0.5">
                          {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-1 h-2 bg-slate-500"></div>
                          ))}
                        </div>
                        <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_5px_#60a5fa]"></div>
                      </div>
                    )}
                  </div>
                  {/* Floor */}
                  <div className="h-1 w-64 bg-slate-700 -ml-8 mt-1"></div>
                </div>

                <div className="mt-6 flex gap-4 text-xs text-slate-500 font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div> Active
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-700 rounded-full"></div> Idle
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-5">
                <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-300">
                  Tradeoffs
                </div>
                <ul className="space-y-2">
                  {platformDecision.tradeoffs.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-slate-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-5">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                  What this platform should prove
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  The chosen platform should reduce the dominant workload risk, not just improve a spec sheet. If it does not change the actual failure signature, the architecture story is still incomplete.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 mb-12">
          <TelemetryWatchPanel
            title="Platform validation telemetry"
            intro="These watchpoints follow the active platform because different platform choices are supposed to solve different architecture problems."
            items={platformDecision.telemetry}
          />
        </div>

        <div className="mb-12">
          <RunbookLinksPanel
            title="If the platform story turns into an incident"
            intro="These are the first operational paths to open when the selected platform still is not behaving as intended."
            items={platformDecision.runbooks}
          />
        </div>

        <div className="mb-12">
          <InfrastructureImplicationsPanel items={PLATFORM_IMPLICATIONS} />
        </div>

        <SoWhatCallout body="Do not choose a platform because one series sounds stronger in isolation. Choose it because the workload and failure signature prove that radix, deep buffering, modularity, or observability are the next real architecture constraint." />
      </div>
    </section>
  );
};

export default HardwareSection;
