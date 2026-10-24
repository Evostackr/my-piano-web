/**
 * SEO, AEO, GEO, AIO, SXO & AI Search Optimization - Type Definitions
 */

export type IssueSeverity = 'CRITICAL' | 'WARNING' | 'PASS' | 'INFO';

export interface AuditFinding {
  id: string;
  category: 'TECHNICAL' | 'ON_PAGE' | 'AEO' | 'GEO' | 'SXO' | 'SCHEMA' | 'CRO';
  severity: IssueSeverity;
  title: string;
  description: string;
  evidence: string;
  recommendation: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface WebVitalsMetrics {
  ttfb: number | null; // ms
  fcp: number | null; // ms
  lcp: number | null; // ms
  cls: number | null; // score
  inp: number | null; // ms
  domInteractive: number | null; // ms
  audioLatencyMs: number | null; // ms
}

export interface DimensionScore {
  name: string;
  score: number; // 0 - 100
  weight: number; // percentage
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';
  methodology: string;
  limitations: string;
}

export interface OverallOptimizationScorecard {
  overallScore: number;
  dimensions: DimensionScore[];
  totalChecks: number;
  passedChecks: number;
  warningChecks: number;
  criticalChecks: number;
  timestamp: string;
}

export interface EntityNode {
  id: string;
  name: string;
  type: string;
  description: string;
  sameAs?: string[];
  relationships: { relation: string; targetId: string }[];
}

export interface TopicClusterNode {
  id: string;
  title: string;
  type: 'PILLAR' | 'SUBTOPIC' | 'SUPPORTING';
  url: string;
  searchIntent: 'INFORMATIONAL' | 'NAVIGATIONAL' | 'COMMERCIAL' | 'TRANSACTIONAL';
  coverageScore: number; // 0 - 100
  parentTopicId?: string;
}

export interface EngagementTelemetry {
  sessionDurationSec: number;
  keysPlayedCount: number;
  chordsPlayedCount: number;
  octavesNavigatedCount: number;
  shortcutsToggledCount: number;
  fullscreenToggledCount: number;
  helpViewedCount: number;
  contactClicksCount: number;
  taskCompleted: boolean;
}

export type AdapterStatus = 'CONNECTED' | 'API_KEY_REQUIRED' | 'ESTIMATED' | 'NOT_AVAILABLE';

export interface ExternalAdapterInfo {
  provider: 'GOOGLE_SEARCH_CONSOLE' | 'GOOGLE_ANALYTICS_4' | 'PAGESPEED_INSIGHTS' | 'PERPLEXITY_AI';
  name: string;
  status: AdapterStatus;
  description: string;
  details: string;
  connectedAt?: string;
}
