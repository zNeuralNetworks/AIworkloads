import React from 'react';
import { motion } from 'framer-motion';

interface MiniPatternPreviewProps {
  patternId?: string;
}

const MiniPatternPreview: React.FC<MiniPatternPreviewProps> = ({ patternId }) => {
  switch (patternId) {
    case 'all-to-all':
      return <AllToAllMini />;
    case 'parameter-server':
      return <ParameterServerMini />;
    case 'checkpoint-burst':
      return <CheckpointBurstMini />;
    case 'all-reduce':
    default:
      return <AllReduceMini />;
  }
};

const PreviewShell: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-4">
    <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
      Inferred traffic pattern
    </div>
    <div className="mb-3 text-sm font-semibold text-white">{title}</div>
    <div className="h-24 w-full">{children}</div>
  </div>
);

// ─── Node colour: indigo/blue matching the hero palette ──────────────────────
const NODE_COLOR   = '#818cf8';  // indigo-400
const NODE_GLOW    = 'drop-shadow(0 0 5px rgba(99,102,241,0.7))';
const PACKET_COLOR = '#6366f1';  // indigo-500
const EDGE_COLOR   = '#6366f1';

// ─── All-Reduce ───────────────────────────────────────────────────────────────
const AR_NODES = [
  { id: 'l', cx: 24,  cy: 48 },
  { id: 't', cx: 88,  cy: 10 },
  { id: 'r', cx: 152, cy: 48 },
  { id: 'b', cx: 88,  cy: 86 },
];

const AllReduceMini: React.FC = () => (
  <PreviewShell title="All-Reduce">
    <svg className="h-full w-full" viewBox="0 0 176 96">
      {/* Edges */}
      <path d="M24,48 L88,10 L152,48 L88,86 Z" stroke={EDGE_COLOR} strokeWidth="1" fill="none" strokeOpacity="0.3" />
      <line x1="24" y1="48" x2="152" y2="48" stroke={EDGE_COLOR} strokeWidth="1" strokeOpacity="0.2" />
      <line x1="88" y1="10" x2="88"  y2="86" stroke={EDGE_COLOR} strokeWidth="1" strokeOpacity="0.2" />

      {/* Packet 1 — clockwise */}
      <motion.circle
        r={3.5} fill={PACKET_COLOR}
        animate={{ cx: [24, 88, 152, 88, 24], cy: [48, 10, 48, 86, 48] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        style={{ filter: NODE_GLOW }}
      />
      {/* Packet 2 — counter-clockwise */}
      <motion.circle
        r={3} fill={NODE_COLOR}
        animate={{ cx: [152, 88, 24, 88, 152], cy: [48, 10, 48, 86, 48] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', delay: 1.2 }}
        style={{ filter: NODE_GLOW }}
      />
      {/* Vertical cross packet */}
      <motion.circle
        r={2.5} fill={EDGE_COLOR}
        animate={{ cx: [88, 88], cy: [10, 86] }}
        transition={{ duration: 1.0, repeat: Infinity, ease: 'linear', repeatType: 'reverse', delay: 0.4 }}
        style={{ filter: NODE_GLOW }}
      />

      {/* Nodes — staggered pulse */}
      {AR_NODES.map((n, i) => (
        <React.Fragment key={n.id}>
          <motion.circle
            cx={n.cx} cy={n.cy} fill="none" stroke={NODE_COLOR} strokeWidth="1.2"
            animate={{ r: [7, 11, 7], opacity: [0.3, 0.08, 0.3] }}
            transition={{ duration: 2.0, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
          />
          <motion.circle
            cx={n.cx} cy={n.cy} fill={NODE_COLOR}
            animate={{ r: [4.5, 5.5, 4.5], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2.0, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
            style={{ filter: NODE_GLOW }}
          />
        </React.Fragment>
      ))}
    </svg>
  </PreviewShell>
);

// ─── All-to-All ───────────────────────────────────────────────────────────────
const LEFT_NODES  = [{ cx: 28, cy: 20 }, { cx: 28, cy: 48 }, { cx: 28, cy: 76 }];
const RIGHT_NODES = [{ cx: 148, cy: 20 }, { cx: 148, cy: 48 }, { cx: 148, cy: 76 }];
const ATA_PACKETS = [
  { from: LEFT_NODES[0],  to: RIGHT_NODES[2], delay: 0.0 },
  { from: LEFT_NODES[1],  to: RIGHT_NODES[0], delay: 0.3 },
  { from: LEFT_NODES[2],  to: RIGHT_NODES[1], delay: 0.6 },
  { from: RIGHT_NODES[0], to: LEFT_NODES[1],  delay: 0.9 },
  { from: RIGHT_NODES[2], to: LEFT_NODES[0],  delay: 1.2 },
];

const AllToAllMini: React.FC = () => (
  <PreviewShell title="All-to-All">
    <svg className="h-full w-full" viewBox="0 0 176 96">
      {LEFT_NODES.map((l) =>
        RIGHT_NODES.map((r) => (
          <line
            key={`${l.cy}-${r.cy}`}
            x1={l.cx} y1={l.cy} x2={r.cx} y2={r.cy}
            stroke={EDGE_COLOR} strokeWidth="0.75" strokeOpacity="0.15"
          />
        ))
      )}
      {ATA_PACKETS.map((p, i) => (
        <motion.circle
          key={i} r={3.2} fill={PACKET_COLOR}
          animate={{
            cx: [p.from.cx, p.to.cx],
            cy: [p.from.cy, p.to.cy],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: p.delay, repeatDelay: 0.5 }}
          style={{ filter: NODE_GLOW }}
        />
      ))}
      {LEFT_NODES.map((n, i) => (
        <motion.circle
          key={`l${i}`} cx={n.cx} cy={n.cy} fill={NODE_COLOR}
          animate={{ r: [5, 6.5, 5], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.35 }}
          style={{ filter: NODE_GLOW }}
        />
      ))}
      {RIGHT_NODES.map((n, i) => (
        <motion.circle
          key={`r${i}`} cx={n.cx} cy={n.cy} fill={PACKET_COLOR}
          animate={{ r: [5, 6.5, 5], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.35 + 0.8 }}
          style={{ filter: NODE_GLOW }}
        />
      ))}
    </svg>
  </PreviewShell>
);

// ─── Parameter Server ─────────────────────────────────────────────────────────
const PS_WORKERS = [{ cy: 18 }, { cy: 48 }, { cy: 78 }];
const PS_WX = 32;
const PS_AX = 144;
const PS_AY = 48;

const ParameterServerMini: React.FC = () => (
  <PreviewShell title="Parameter Server">
    <svg className="h-full w-full" viewBox="0 0 176 96">
      {PS_WORKERS.map((w, i) => (
        <line key={i} x1={PS_WX} y1={w.cy} x2={PS_AX} y2={PS_AY}
          stroke={EDGE_COLOR} strokeWidth="0.75" strokeOpacity="0.2" />
      ))}
      {PS_WORKERS.map((w, i) => (
        <motion.circle
          key={i} r={3} fill={PACKET_COLOR}
          animate={{ cx: [PS_WX, PS_AX], cy: [w.cy, PS_AY], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.95, repeat: Infinity, ease: 'easeIn', delay: i * 0.32, repeatDelay: 0.7 }}
          style={{ filter: NODE_GLOW }}
        />
      ))}
      {PS_WORKERS.map((w, i) => (
        <motion.circle
          key={`w${i}`} cx={PS_WX} cy={w.cy} fill={NODE_COLOR}
          animate={{ r: [5, 6.5, 5] }}
          transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.4 }}
          style={{ filter: NODE_GLOW }}
        />
      ))}
      {/* Aggregator glow ring */}
      <motion.circle
        cx={PS_AX} cy={PS_AY} fill="none" stroke={NODE_COLOR} strokeWidth="1.5"
        animate={{ r: [13, 18, 13], opacity: [0.25, 0.06, 0.25] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Aggregator core */}
      <motion.circle
        cx={PS_AX} cy={PS_AY} r={11} fill="#1e1b4b" stroke={NODE_COLOR} strokeWidth="1.5"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: NODE_GLOW, transformOrigin: `${PS_AX}px ${PS_AY}px` }}
      />
      <text x={PS_AX} y={PS_AY + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fill="#c7d2fe" fontFamily="monospace" style={{ pointerEvents: 'none' }}>
        AGG
      </text>
    </svg>
  </PreviewShell>
);

// ─── Checkpoint Burst ─────────────────────────────────────────────────────────
const CP_SOURCES = [{ cy: 18 }, { cy: 48 }, { cy: 78 }];
const CP_SX = 30;
const CP_TX = 148;
const CP_TY = 48;

const CheckpointBurstMini: React.FC = () => (
  <PreviewShell title="Checkpoint Burst">
    <svg className="h-full w-full" viewBox="0 0 176 96">
      {CP_SOURCES.map((s, i) => (
        <line key={i} x1={CP_SX} y1={s.cy} x2={CP_TX} y2={CP_TY}
          stroke={EDGE_COLOR} strokeWidth="0.75" strokeOpacity="0.18" />
      ))}
      {CP_SOURCES.map((s, i) => (
        <motion.circle
          key={i} fill={PACKET_COLOR}
          animate={{
            cx: [CP_SX, CP_TX],
            cy: [s.cy, CP_TY],
            opacity: [0, 1, 1, 0],
            r: [3.5, 2.5, 2.5, 0.5],
          }}
          transition={{ duration: 0.75, repeat: Infinity, ease: 'easeOut', delay: i * 0.06, repeatDelay: 1.8 }}
          style={{ filter: NODE_GLOW }}
        />
      ))}
      {CP_SOURCES.map((s, i) => (
        <motion.circle
          key={`s${i}`} cx={CP_SX} cy={s.cy} fill={NODE_COLOR}
          animate={{ r: [5, 7, 5], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
          style={{ filter: NODE_GLOW }}
        />
      ))}
      {/* Storage pressure ring — uses a slightly warmer blue-slate to suggest stress */}
      <motion.circle
        cx={CP_TX} cy={CP_TY} fill="none" stroke="#94a3b8" strokeWidth="1"
        animate={{ r: [13, 20, 13], opacity: [0.12, 0.35, 0.12] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.65 }}
      />
      <motion.circle
        cx={CP_TX} cy={CP_TY} r={11}
        fill="#0f172a" stroke={NODE_COLOR} strokeWidth="1.5"
        animate={{ strokeOpacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.65 }}
        style={{ filter: NODE_GLOW }}
      />
      <text x={CP_TX} y={CP_TY + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="6.5" fill="#c7d2fe" fontFamily="monospace" style={{ pointerEvents: 'none' }}>
        DISK
      </text>
    </svg>
  </PreviewShell>
);

export default MiniPatternPreview;
