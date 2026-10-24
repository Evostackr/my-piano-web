import { OverallOptimizationScorecard, DimensionScore, AuditFinding } from './types';
import { technicalAuditor } from './technicalAuditor';
import { aeoGeoEngine } from './aeoGeoEngine';
import { vitalsObserver } from './vitalsObserver';
import { engagementBus } from './engagementBus';

/**
 * Multi-Dimensional Unified Optimization Scoring Engine
 * Computes transparent, weighted scores with explicit methodology and limitation disclosures.
 */
export class ScoringEngine {
  public computeScorecard(): { scorecard: OverallOptimizationScorecard; allFindings: AuditFinding[] } {
    const techFindings = technicalAuditor.runAudit();
    const aeoReport = aeoGeoEngine.evaluateAeoAndGeo();
    const vitals = vitalsObserver.getMetrics();
    const engagement = engagementBus.getTelemetry();

    const allFindings: AuditFinding[] = [...techFindings, ...aeoReport.findings];

    // 1. Technical SEO Health Score (Weight: 25%)
    let techScore = 100;
    techFindings.forEach(f => {
      if (f.category === 'TECHNICAL' || f.category === 'SCHEMA') {
        if (f.severity === 'CRITICAL') techScore -= 25;
        if (f.severity === 'WARNING') techScore -= 10;
      }
    });
    techScore = Math.max(0, Math.min(100, techScore));

    // 2. On-Page & Semantic SEO Score (Weight: 20%)
    let onPageScore = 100;
    techFindings.forEach(f => {
      if (f.category === 'ON_PAGE') {
        if (f.severity === 'CRITICAL') onPageScore -= 30;
        if (f.severity === 'WARNING') onPageScore -= 12;
      }
    });
    onPageScore = Math.max(0, Math.min(100, onPageScore));

    // 3. AEO Readiness Score (Weight: 15%)
    let aeoScore = aeoReport.directAnswerScore;
    if (aeoReport.tableSnippetsFound > 0) aeoScore = Math.min(100, aeoScore + 10);
    if (aeoReport.stepInstructionsFound >= 3) aeoScore = Math.min(100, aeoScore + 10);
    aeoScore = Math.max(0, Math.min(100, aeoScore));

    // 4. GEO & AI Search Discoverability (Weight: 15%)
    let geoScore = aeoReport.entityClarityScore;
    if (aeoReport.llmsTxtDiscovered) geoScore = Math.min(100, geoScore + 15);
    geoScore = Math.max(0, Math.min(100, geoScore));

    // 5. SXO & Real-World Performance (Weight: 15%)
    let sxoScore = 100;
    if (vitals.lcp !== null && vitals.lcp > 2500) sxoScore -= 20;
    if (vitals.cls !== null && vitals.cls > 0.1) sxoScore -= 20;
    if (vitals.inp !== null && vitals.inp > 200) sxoScore -= 20;
    if (vitals.audioLatencyMs !== null && vitals.audioLatencyMs > 50) sxoScore -= 15;
    sxoScore = Math.max(0, Math.min(100, sxoScore));

    // 6. CRO & User Task Completion (Weight: 10%)
    let croScore = 70;
    if (engagement.taskCompleted) croScore += 20;
    if (engagement.octavesNavigatedCount > 0) croScore += 5;
    if (engagement.shortcutsToggledCount > 0) croScore += 5;
    croScore = Math.max(0, Math.min(100, croScore));

    const dimensions: DimensionScore[] = [
      {
        name: 'Technical SEO Health',
        score: techScore,
        weight: 25,
        status: this.getScoreStatus(techScore),
        methodology: 'Evaluates crawlability, canonicals, robots directives, image optimization, schema validity, and internal link resolution.',
        limitations: 'Calculated from client-side DOM analysis; does not replace full server log analysis or external crawler emulation.'
      },
      {
        name: 'On-Page & Semantic SEO',
        score: onPageScore,
        weight: 20,
        status: this.getScoreStatus(onPageScore),
        methodology: 'Evaluates document title, meta description length, heading hierarchy (H1-H6), and keyword relevance.',
        limitations: 'Based on current static HTML content; does not simulate dynamic personalization.'
      },
      {
        name: 'AEO Direct Answer Readiness',
        score: aeoScore,
        weight: 15,
        status: this.getScoreStatus(aeoScore),
        methodology: 'Measures presence and proportion of concise opening direct answers, FAQ pairs, tables, and step-by-step HowTo lists.',
        limitations: 'Indicates technical answer eligibility; does not guarantee third-party answer-engine placement.'
      },
      {
        name: 'GEO & AI Search Discoverability',
        score: geoScore,
        weight: 15,
        status: this.getScoreStatus(geoScore),
        methodology: 'Scores entity clarity (Evostackr attribution), technical specification completeness, and llms.txt discovery file availability.',
        limitations: 'Reflects LLM-readiness of on-page content; does not claim internal knowledge of proprietary LLM retrieval weights.'
      },
      {
        name: 'SXO & Core Web Vitals',
        score: sxoScore,
        weight: 15,
        status: this.getScoreStatus(sxoScore),
        methodology: 'Measures live browser PerformanceObserver data: LCP, CLS, INP, and native Web Audio synthesis latency.',
        limitations: 'Reflects current visitor hardware and network conditions; field metrics from CrUX will vary across devices.'
      },
      {
        name: 'CRO & Interaction Completion',
        score: croScore,
        weight: 10,
        status: this.getScoreStatus(croScore),
        methodology: 'Tracks visitor interaction depth, keyboard shortcut usage, octave exploration, and meaningful note playback.',
        limitations: 'Privacy-focused client-side counter stored in localStorage without cross-device user fingerprinting.'
      }
    ];

    const overallScore = Math.round(
      dimensions.reduce((acc, dim) => acc + (dim.score * (dim.weight / 100)), 0)
    );

    let criticalCount = 0;
    let warningCount = 0;
    let passedCount = 0;

    allFindings.forEach(f => {
      if (f.severity === 'CRITICAL') criticalCount++;
      else if (f.severity === 'WARNING') warningCount++;
      else if (f.severity === 'PASS') passedCount++;
    });

    const scorecard: OverallOptimizationScorecard = {
      overallScore,
      dimensions,
      totalChecks: allFindings.length,
      passedChecks: passedCount,
      warningChecks: warningCount,
      criticalChecks: criticalCount,
      timestamp: new Date().toISOString()
    };

    return { scorecard, allFindings };
  }

  private getScoreStatus(score: number): 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR' {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 75) return 'GOOD';
    if (score >= 60) return 'NEEDS_IMPROVEMENT';
    return 'POOR';
  }
}

export const scoringEngine = new ScoringEngine();
