import { ProductData } from '../types';
import { claim } from '../utils/sourceClaims';
import { claimTextById, getPerformanceClaim } from '../content/claims/performanceClaims';

const PRODUCT_DATASHEET_SOURCE = {
  sourceUrl: 'https://www.arista.com/en/products/ethernet-switches',
  sourceTitle: 'Arista Ethernet Switch Portfolio',
  sourceRevisionOrDate: 'Accessed 2026-03',
  verificationStatus: 'vendor-claim' as const,
};

export const PRODUCTS: ProductData[] = [
  {
    id: '7060X',
    series: '7060X Series',
    role: 'AI Leaf or Spine',
    iconKey: 'Server',
    desc: claim(
      'High-capacity, low-latency Ethernet switching deployable as an AI leaf or spine in smaller fabrics. Fixed form factors ideal for high-scale AI clusters and high-radix topologies. Support for LPO and PCIe integration.',
      PRODUCT_DATASHEET_SOURCE
    ),
    specs: [
      claim(`${claimTextById('product7060Capacity')} Capacity`, PRODUCT_DATASHEET_SOURCE),
      claim('High-radix fixed platform', PRODUCT_DATASHEET_SOURCE),
      claim('800G OSFP', PRODUCT_DATASHEET_SOURCE),
      claim('LPO Support', PRODUCT_DATASHEET_SOURCE),
    ],
    scale: 'AI Leaf & Spine Fabrics',
    datasheetUrl: 'https://www.arista.com/assets/data/pdf/Datasheets/7060X6-Datasheet.pdf',
    keyFeatures: [
      {
        label: 'Power Efficiency',
        value: claimTextById('product7060PowerEfficiency'),
        subtext: 'Lower power per Gbps vs prior gen',
        iconKey: 'Zap',
      },
      {
        label: 'LPO Optics',
        value: claimTextById('product7060LpoReduction'),
        subtext: "Add'l power reduction with Linear Drive",
        iconKey: 'Leaf',
      },
      {
        label: 'Silicon',
        value: 'High-radix fixed platform',
        subtext: 'Current-generation fixed switching architecture',
        iconKey: 'Cpu',
      },
    ],
    variants: [
      {
        name: '7060X6-64PE',
        chip: 'High-radix fixed',
        capacity: claimTextById('product7060Capacity'),
        ports: claimTextById('product7060Ports64x800g'),
        formFactor: '2RU',
      },
      {
        name: '7060X6-64PE-B',
        chip: 'High-radix fixed',
        capacity: claimTextById('product7060Capacity'),
        ports: claimTextById('product7060Ports64x800g'),
        formFactor: '2RU',
      },
      {
        name: '7060X6-32PE',
        chip: 'High-radix fixed',
        capacity: claimTextById('product7060CapacityHalf'),
        ports: claimTextById('product7060Ports32x800g'),
        formFactor: '1RU',
      },
    ],
  },
  {
    id: '7800R',
    series: '7800R Series',
    role: 'Modular AI Spine',
    iconKey: 'Layers',
    desc: claim(
      `The definitive modular platform for large-scale AI spines. Delivers up to ${claimTextById('product7800CapacityTbps')} system capacity with a lossless, cell-based fabric and Virtual Output Queuing (VOQ) to eliminate head-of-line blocking.`,
      PRODUCT_DATASHEET_SOURCE
    ),
    specs: [
      claim('Deep-buffer modular platform', PRODUCT_DATASHEET_SOURCE),
      claim(`${claimTextById('product7800CapacityTbps')} Capacity`, PRODUCT_DATASHEET_SOURCE),
      claim(`${claimTextById('product7800Ports576x800g')} Ports`, PRODUCT_DATASHEET_SOURCE),
      claim('Deep Buffers', PRODUCT_DATASHEET_SOURCE),
    ],
    scale: 'Large Scale Clusters',
    datasheetUrl:
      'https://www.arista.com/assets/data/pdf/Datasheets/7800R4-Series-AI-Spine-Datasheet.pdf',
    keyFeatures: [
      {
        label: 'Fabric',
        value: 'Cell-Based',
        subtext: claimTextById('product7800FabricFairness'),
        iconKey: 'CircuitBoard',
      },
      {
        label: 'Throughput',
        value: claimTextById('product7800CapacityTbps'),
        subtext: 'Max system capacity',
        iconKey: 'Activity',
      },
      {
        label: 'Buffering',
        value: 'Deep Buffers',
        subtext: 'Virtual Output Queuing',
        iconKey: 'Layers',
      },
    ],
    variants: [
      {
        name: 'DCS-7816L',
        chip: 'Chassis',
        capacity: claimTextById('product7800Capacity460t'),
        ports: claimTextById('product7800Ports576x800g'),
        formFactor: '16-Slot',
      },
      {
        name: 'DCS-7812',
        chip: 'Chassis',
        capacity: 'High Scale',
        ports: 'Modular',
        formFactor: '12-Slot',
      },
      {
        name: 'DCS-7808',
        chip: 'Chassis',
        capacity: 'High Scale',
        ports: 'Modular',
        formFactor: '8-Slot',
      },
      {
        name: 'DCS-7804',
        chip: 'Chassis',
        capacity: 'High Scale',
        ports: 'Modular',
        formFactor: '4-Slot',
      },
      {
        name: '7800R4C-36PE',
        chip: 'Linecard',
        capacity: claimTextById('product7800LinecardCapacity'),
        ports: claimTextById('product7800LinecardPorts'),
        formFactor: 'Linecard',
      },
      {
        name: '7800R4-36PE',
        chip: 'Linecard',
        capacity: claimTextById('product7800LinecardCapacity'),
        ports: claimTextById('product7800LinecardPorts'),
        formFactor: 'Linecard',
      },
      {
        name: '7800R4K-36PE',
        chip: 'Linecard',
        capacity: claimTextById('product7800LinecardCapacity'),
        ports: claimTextById('product7800LinecardPorts'),
        formFactor: 'Linecard',
      },
    ],
  },
  {
    id: '7700R',
    series: '7700R DES',
    role: 'Distributed Switch',
    iconKey: 'CircuitBoard',
    desc: claim(
      'Distributed Etherlink Switch (DES) enables the scale of a multi-stage CLOS fabric with the simplicity of a single logical node. Provides a single-hop, predictable, and lossless interconnect for massive AI clusters.',
      PRODUCT_DATASHEET_SOURCE
    ),
    specs: [
      claim('Single-Hop Architecture', PRODUCT_DATASHEET_SOURCE),
      getPerformanceClaim('product7700SpecNonBlocking'),
      claim('Auto-tuned fabric', PRODUCT_DATASHEET_SOURCE),
      getPerformanceClaim('product7700OpticPowerReduction'),
    ],
    scale: 'Ultra-Large Scale (Single Hop)',
    datasheetUrl:
      'https://www.arista.com/assets/data/pdf/Datasheets/7800R4-Series-AI-Spine-Datasheet.pdf',
    keyFeatures: [
      {
        label: 'Topology',
        value: 'Single Hop',
        subtext: 'Logical single-tier design',
        iconKey: 'Network',
      },
      {
        label: 'Scale',
        value: claimTextById('product7700Scale'),
        subtext: 'Supports 32,000+ endpoints',
        iconKey: 'Globe',
      },
      {
        label: 'Scheduling',
        value: 'Scheduled',
        subtext: 'Lossless fabric behavior',
        iconKey: 'ShieldCheck',
      },
    ],
    variants: [
      {
        name: 'DES Leaf',
        chip: 'Deep-buffer modular',
        capacity: 'N/A',
        ports: claimTextById('product7700Ports18x800gHost'),
        formFactor: 'Fixed',
      },
      {
        name: 'DES Fabric',
        chip: 'Fabric',
        capacity: 'N/A',
        ports: claimTextById('product7700Ports128x800g'),
        formFactor: 'Fixed',
      },
      {
        name: 'Cluster Limit',
        chip: 'Distributed',
        capacity: 'High Scale',
        ports: claimTextById('product7700Ports16kx800g'),
        formFactor: 'Logical',
      },
    ],
  },
  {
    id: '7280R3',
    series: '7280R3 Series',
    role: 'Universal Leaf for Storage',
    iconKey: 'HardDrive',
    desc: claim(
      `Purpose-built for IP storage and data-intensive workloads. Features dynamic deep packet buffers (${claimTextById('product7280BufferUpTo8gb')}) that absorb microbursts common in storage environments (NVMe-oF, iSCSI). Utilizes VOQ to ensure lossless behavior under congestion.`,
      PRODUCT_DATASHEET_SOURCE
    ),
    specs: [
      claim('Deep-buffer fixed platform', PRODUCT_DATASHEET_SOURCE),
      claim('Deep Buffers', PRODUCT_DATASHEET_SOURCE),
      getPerformanceClaim('product7280Spec100g400g'),
      claim('VOQ Architecture', PRODUCT_DATASHEET_SOURCE),
    ],
    scale: 'Storage & WAN Edge',
    datasheetUrl: 'https://www.arista.com/assets/data/pdf/Datasheets/7280R3-Datasheet.pdf',
    keyFeatures: [
      {
        label: 'Buffering',
        value: 'Dynamic',
        subtext: 'Absorbs storage microbursts',
        iconKey: 'Layers',
      },
      { label: 'Storage', value: 'Optimized', subtext: 'Ideal for NVMe/RoCE', iconKey: 'Database' },
      {
        label: 'Reliability',
        value: 'Lossless',
        subtext: 'VOQ eliminates HOL blocking',
        iconKey: 'ShieldCheck',
      },
    ],
    variants: [
      {
        name: '7280CR3',
        chip: 'Deep-buffer fixed',
        capacity: claimTextById('product7280Capacity96t'),
        ports: 'Fixed 400G',
        formFactor: '1RU/2RU',
      },
      {
        name: '7280SR3',
        chip: 'Deep-buffer fixed',
        capacity: 'Various',
        ports: claimTextById('product7280Ports100g25g'),
        formFactor: '1RU',
      },
    ],
  },
  {
    id: '7280R3A',
    series: '7280R3A Series',
    role: 'Universal Leaf for Storage',
    iconKey: 'Database',
    desc: claim(
      'Evolution of the R3 series delivering higher density and power efficiency for AI storage fabrics. Features ultra-deep buffers and deeper buffer pools for lossless AI training data retrieval and high-density storage fabrics.',
      PRODUCT_DATASHEET_SOURCE
    ),
    specs: [
      claim('Deep-buffer fixed platform with enhanced telemetry', PRODUCT_DATASHEET_SOURCE),
      claim('Algorithmic ACLs', PRODUCT_DATASHEET_SOURCE),
      getPerformanceClaim('product7280aSpec400g'),
      claim('In-band Telemetry', PRODUCT_DATASHEET_SOURCE),
    ],
    scale: 'AI Storage Fabrics',
    datasheetUrl: 'https://www.arista.com/assets/data/pdf/Datasheets/7280R3A-Modular-Datasheet.pdf',
    keyFeatures: [
      {
        label: 'Architecture',
        value: 'VOQ',
        subtext: 'Eliminates HOL blocking',
        iconKey: 'ShieldCheck',
      },
      {
        label: 'Telemetry',
        value: 'INT',
        subtext: 'In-band Network Telemetry',
        iconKey: 'Activity',
      },
      { label: 'Security', value: 'MACsec', subtext: 'Line rate encryption', iconKey: 'Lock' },
    ],
    variants: [
      {
        name: '7280DR3A-54',
        chip: 'Deep-buffer fixed (enhanced telemetry)',
        capacity: 'High Scale',
        ports: '400G Optimized',
        formFactor: 'Fixed',
      },
      {
        name: '7280DR3A-36',
        chip: 'Deep-buffer fixed (enhanced telemetry)',
        capacity: claimTextById('product7280aCapacity144t'),
        ports: claimTextById('product7280aPorts36x400g'),
        formFactor: '1RU',
      },
      {
        name: '7280CR3A-24D12',
        chip: 'Deep-buffer fixed (enhanced telemetry)',
        capacity: 'Mix',
        ports: claimTextById('product7280aPorts24x100g12x400g'),
        formFactor: '1RU',
      },
      {
        name: '7280CR3A-48D6',
        chip: 'Deep-buffer fixed (enhanced telemetry)',
        capacity: 'Mix',
        ports: claimTextById('product7280aPorts48x100g6x400g'),
        formFactor: '1RU',
      },
      {
        name: '7280CR3A-72',
        chip: 'Deep-buffer fixed (enhanced telemetry)',
        capacity: claimTextById('product7280aCapacity72t'),
        ports: claimTextById('product7280aPorts72x100g'),
        formFactor: '2RU',
      },
      {
        name: '7280CR3A-32S',
        chip: 'Deep-buffer fixed (enhanced telemetry)',
        capacity: claimTextById('product7280aCapacity32t'),
        ports: claimTextById('product7280aPorts32x100g'),
        formFactor: '1RU',
      },
      {
        name: '7280SR3A-48YC8',
        chip: 'Deep-buffer fixed (enhanced telemetry)',
        capacity: 'Low Latency',
        ports: claimTextById('product7280aPorts48x25g8x100g'),
        formFactor: '1RU',
      },
    ],
  },
];
