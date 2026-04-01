import { claim } from '../utils/sourceClaims';
import { claimTextById, getPerformanceClaim } from './claims/performanceClaims';

const ETHERLINK_SOURCE = {
  sourceUrl:
    'https://www.arista.com/assets/data/pdf/Whitepapers/Arista-Etherlink-AI-Networking-Architecture-Whitepaper.pdf',
  sourceTitle: 'Arista Etherlink AI Networking Architecture Whitepaper',
  sourceRevisionOrDate: '2024',
  verificationStatus: 'vendor-claim' as const,
};

export const PERFORMANCE_SECTION_CONTENT = {
  moduleLabel: 'Domain · Performance Implications',
  title: 'Performance Metrics',
  subtitle: claim(
    'Telemetry showing the impact of congestion control and failover on Job Completion Time (JCT).',
    ETHERLINK_SOURCE,
    'perfSectionSubtitle'
  ),
  systemStatusLabel: 'System Active',
  stats: [
    {
      label: 'Effective Throughput',
      value: claimTextById('perfEffectiveThroughputPercent'),
      unit: '%',
      trend: getPerformanceClaim('perfThroughputTrendDelta'),
      iconKey: 'activity',
    },
    {
      label: 'Failover Time',
      value: claimTextById('perfFailoverTimeMs'),
      unit: 'ms',
      trend: getPerformanceClaim('perfFailoverTrendMultiplier'),
      iconKey: 'zap',
    },
    {
      label: 'Buffer Usage',
      value: claimTextById('perfBufferUsageMb'),
      unit: 'MB',
      trend: claim('Optimized', ETHERLINK_SOURCE, 'perfBufferUsageTrend'),
      iconKey: 'zap',
    },
    {
      label: 'JCT Reduction',
      value: claimTextById('perfJctReductionPercent'),
      unit: '%',
      trend: claim('Consistent', ETHERLINK_SOURCE, 'perfJctReductionTrend'),
      iconKey: 'trendingUp',
    },
  ],
  charts: {
    bandwidth: {
      title: 'Bandwidth Efficiency',
      subtitle: claim(
        'Cluster Load Balancing (CLB) vs Standard ECMP',
        ETHERLINK_SOURCE,
        'perfBandwidthChartSubtitle'
      ),
    },
    failover: {
      title: 'Failover Convergence',
      subtitle: claim(
        'Time to recover from link failure (ms)',
        ETHERLINK_SOURCE,
        'perfFailoverChartSubtitle'
      ),
    },
  },
} as const;
