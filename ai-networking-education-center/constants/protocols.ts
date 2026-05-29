
import { ProtocolConcept, CongestionStep } from '../types';

export const CONGESTION_PROCEDURE: CongestionStep[] = [
  {
    step: 1,
    title: 'Classify Workload',
    details: [
      'AllReduce-heavy → synchronous, tight timing, ECN tuning critical',
      'MoE / mixture-of-experts → asynchronous fan-out, incast risk dominant',
      'Checkpoint-heavy → burst isolation required, separate storage QoS class',
    ],
  },
  {
    step: 2,
    title: 'ECN Threshold Baseline',
    details: [
      'AllReduce-heavy: set ECN marking threshold at 30–40% of buffer',
      'MoE: set threshold at 20–30% (lower = faster response to incast)',
    ],
  },
  {
    step: 3,
    title: 'PFC Scope',
    details: [
      'Scope PFC only to the RoCEv2 no-drop traffic class, for example Q3 where that is the selected class mapping',
      'Never extend PFC to best-effort queues',
    ],
  },
  {
    step: 4,
    title: 'Load Balancing Selection',
    details: [
      'DLB/CLB are path-distribution tools; use only where supported by the platform and topology role',
      'UET packet spraying changes pathing assumptions but still needs endpoint and telemetry validation',
    ],
  },
  {
    step: 5,
    title: 'DCQCN Validation',
    details: [
      'Verify NIC ECN response via EOS counter checks',
      'Confirm CNP (Congestion Notification Packet) generation',
      'Check rate reduction under sustained load',
    ],
  },
];

export const PROTOCOL_CONCEPTS: ProtocolConcept[] = [
  {
    id: 'roce',
    title: 'RoCEv2 Control Posture',
    subtitle: 'ECN + DCQCN + scoped PFC',
    description: 'RoCEv2 depends on disciplined lossless behavior: ECN should mark early, DCQCN/CNP should reduce sender rate, and PFC should stay a brief local backstop.',
    iconKey: 'Activity',
    color: 'blue',
    mechanisms: [
      {
        name: 'PFC Scope',
        desc: 'Link-local backstop for the selected no-drop traffic class, not a fabric-wide steady-state control loop.',
        iconKey: 'AlertCircle',
      },
      {
        name: 'ECN Marking',
        desc: 'Switch-side early warning before queue exhaustion.',
        iconKey: 'Radio',
      },
      {
        name: 'CNP / DCQCN Reaction',
        desc: 'Endpoint feedback loop that reduces sender rate after ECN-marked congestion.',
        iconKey: 'ShieldCheck',
      },
    ],
  },
  {
    id: 'uec',
    title: 'UET Transport Posture',
    subtitle: 'Loss tolerance + flexible ordering',
    description: 'UET changes the transport model with loss tolerance, flexible ordering, and selective recovery. It can reduce dependence on flow-hash affinity, but it still needs pathing and telemetry discipline.',
    iconKey: 'Zap',
    color: 'green',
    mechanisms: [
      {
        name: 'Packet Spraying',
        desc: 'Distributes packets across multiple paths and shifts the problem away from flow-hash collisions, assuming endpoint reordering/recovery works.',
        iconKey: 'GitMerge',
      },
      {
        name: 'Flexible Ordering',
        desc: 'Allows packets to arrive out of order when the transport and endpoint can reconstruct the stream.',
        iconKey: 'ArrowLeftRight',
      },
      {
        name: 'Selective Recovery',
        desc: 'Retransmits only the affected data instead of treating every loss event as a full-window failure.',
        iconKey: 'CircuitBoard',
      },
    ],
  },
  {
    id: 'load-balancing',
    title: 'Path Distribution',
    subtitle: 'ECMP → DLB → CLB → Packet Spraying',
    description: 'Path distribution is not a transport. It determines whether synchronized flows, bursts, or packet-sprayed traffic actually use the available fabric without hiding hotspot geometry.',
    iconKey: 'GitMerge',
    color: 'purple',
    mechanisms: [
      {
        name: 'ECMP: Flow-hash baseline',
        desc: 'Stateless and deterministic, but vulnerable when synchronized elephant flows collide on the same links.',
        iconKey: 'Network',
      },
      {
        name: 'DLB: Dynamic Load Balancing',
        desc: 'Path-distribution tool for supported leaf platforms; reacts to observed path pressure rather than workload intent.',
        iconKey: 'Activity',
      },
      {
        name: 'CLB: Cluster Load Balancing',
        desc: 'Spine-level pathing posture for supported topologies; useful when collective behavior defeats simple hashing.',
        iconKey: 'Layers',
      },
      {
        name: 'Packet Spraying',
        desc: 'Uses multiple paths at packet granularity when the transport and endpoint can handle reordering and recovery.',
        iconKey: 'GitMerge',
      },
    ],
  },
];
