import { claim } from '../utils/sourceClaims';

const NVME_SOURCE = {
  sourceUrl: 'https://nvmexpress.org/specifications/',
  sourceTitle: 'NVM Express Specifications',
  sourceRevisionOrDate: '2025',
  verificationStatus: 'verified' as const,
};

const RDMA_SOURCE = {
  sourceUrl: 'https://www.infinibandta.org/about-rdma/',
  sourceTitle: 'InfiniBand Trade Association - About RDMA',
  sourceRevisionOrDate: 'Accessed 2026-03',
  verificationStatus: 'verified' as const,
};

export const CONCEPTS_SECTION_CONTENT = {
  moduleLabel: 'Domain · Data Movement',
  title: 'Data Movement',
  subtitle: claim(
    'High-performance AI networking relies on foundational technologies that minimize latency and maximize data throughput between XPUs and storage.',
    RDMA_SOURCE
  ),
  rdmaVisualization: {
    ariaLabel:
      'Animation demonstrating RDMA Zero-Copy networking. A blue packet moves directly from Server A memory to Server B memory, visually traversing a bypass path that avoids the CPU and OS kernel layers.',
    sourceLabel: 'Server A Memory',
    destinationLabel: 'Server B Memory',
    bypassCaption: claim('Bypassing CPU & OS Kernel', RDMA_SOURCE)
  },
  nvmeExpansion: {
    title: 'NVMe over Fabrics',
    goalLabel: 'The Goal:',
    goalBody: claim(
      'Build a fabric to disaggregate NVMe SSDs and compute without compromising on latency. This allows for independent scaling of storage and compute resources.',
      NVME_SOURCE
    ),
    mechanismLabel: 'Mechanism:',
    mechanismBodyPrefix: 'The fabric can be built using different transport mechanisms such as',
    mechanismBodySuffix: 'and',
    abstractionNote: claim(
      'Requires Controller-side and Host-side abstraction layers to support the specific transport.',
      NVME_SOURCE
    )
  },
  packetFlow: {
    ariaLabel: 'Diagram illustrating the NVMe connection sequence',
    title: 'NVMe Packet Flow',
    connectionRequestTitle: 'Connection Request',
    connectionRequestBody: claim('Host initiates connection message. Controller listens.', NVME_SOURCE),
    connectionResponseTitle: 'Connection Response',
    connectionResponseBody: claim('Controller acknowledges initial communications.', NVME_SOURCE),
    exchangePduLabel: 'EXCHANGE PDU',
    initConfirmTitle: 'Initialization & Confirm',
    initConfirmBody: claim('Host requests Init. Controller confirms.', NVME_SOURCE),
    transparencyPrefix: 'Regardless of transport (NVMeoTCP or NVMeoRoCE), this connection setup is',
    transparentWord: 'transparent',
    transparencySuffix: claim('to the networking side.', NVME_SOURCE)
  }
} as const;
