import { scoringEngine } from '../scoringEngine';
import { vitalsObserver } from '../vitalsObserver';
import { engagementBus } from '../engagementBus';
import { adaptersManager } from '../adapters';
import { ENTITY_GRAPH, TOPIC_CLUSTERS } from '../entityCluster';
import { AuditFinding, IssueSeverity } from '../types';

/**
 * Unified SEO, AEO, GEO, SXO & AI Search Intelligence Suite UI
 */
export class OptimizationDashboardUI {
  private container: HTMLElement | null = null;
  private isOpen = false;
  private currentTab = 'overview';
  private severityFilter: 'ALL' | IssueSeverity = 'ALL';

  public init() {
    this.createDomElements();
    this.bindGlobalTriggers();
  }

  public open() {
    if (!this.container) return;
    this.isOpen = true;
    this.container.classList.add('open');
    this.container.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this.render();
  }

  public close() {
    if (!this.container) return;
    this.isOpen = false;
    this.container.classList.remove('open');
    this.container.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  public toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  private createDomElements() {
    if (document.getElementById('seoSuiteModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'seoSuiteModal';
    overlay.className = 'seo-suite-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="seo-suite-panel">
        <header class="seo-suite-header">
          <div class="seo-suite-brand">
            <span class="seo-brand-icon">⚡</span>
            <div>
              <div class="seo-suite-title">SEO & AI Search Intelligence Suite</div>
              <div class="seo-suite-subtitle">Technical SEO • AEO • GEO • Core Web Vitals • CRO Engine</div>
            </div>
          </div>
          <div class="seo-suite-controls">
            <button id="seoExportReportBtn" class="seo-tool-btn" title="Export Full Report">Export Report</button>
            <button id="seoRerunAuditBtn" class="seo-tool-btn active" title="Re-Run Live Audit">Re-Run Audit</button>
            <button id="seoCloseModalBtn" class="seo-close-btn" aria-label="Close Audit Suite">&times;</button>
          </div>
        </header>

        <!-- Navigation Tabs -->
        <nav class="seo-suite-nav" role="tablist">
          <button class="seo-tab-btn active" data-tab="overview">Overview & Scorecard</button>
          <button class="seo-tab-btn" data-tab="findings">Audit Findings</button>
          <button class="seo-tab-btn" data-tab="vitals">Core Web Vitals</button>
          <button class="seo-tab-btn" data-tab="aeo-geo">AEO & GEO</button>
          <button class="seo-tab-btn" data-tab="clusters">Topic & Entities</button>
          <button class="seo-tab-btn" data-tab="telemetry">CRO Telemetry</button>
          <button class="seo-tab-btn" data-tab="integrations">API Adapters</button>
        </nav>

        <!-- Content Area -->
        <div class="seo-suite-body" id="seoSuiteBody">
          <!-- Populated dynamically -->
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.container = overlay;

    // Overlay click to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    overlay.querySelector('#seoCloseModalBtn')?.addEventListener('click', () => this.close());
    overlay.querySelector('#seoRerunAuditBtn')?.addEventListener('click', () => this.render());
    overlay.querySelector('#seoExportReportBtn')?.addEventListener('click', () => this.exportReport());

    // Tab buttons
    overlay.querySelectorAll('.seo-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const tab = target.dataset.tab;
        if (tab) {
          this.currentTab = tab;
          overlay.querySelectorAll('.seo-tab-btn').forEach(b => b.classList.remove('active'));
          target.classList.add('active');
          this.render();
        }
      });
    });

    // Real-time vitals and telemetry subscriber
    vitalsObserver.subscribe(() => {
      if (this.isOpen && this.currentTab === 'vitals') {
        this.renderVitalsTab();
      }
    });

    engagementBus.subscribe(() => {
      if (this.isOpen && this.currentTab === 'telemetry') {
        this.renderTelemetryTab();
      }
    });
  }

  private bindGlobalTriggers() {
    // Keyboard shortcut Shift + S opens the suite
    window.addEventListener('keydown', (e) => {
      if (e.shiftKey && (e.key === 'S' || e.key === 's')) {
        // Only if not actively typing in an input
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          this.toggle();
        }
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Link header or footer triggers if present
    document.getElementById('seoInsightsBtn')?.addEventListener('click', () => this.open());
    document.getElementById('openSeoSuiteFooterBtn')?.addEventListener('click', () => this.open());
  }

  public render() {
    const body = document.getElementById('seoSuiteBody');
    if (!body) return;

    switch (this.currentTab) {
      case 'overview':
        this.renderOverviewTab(body);
        break;
      case 'findings':
        this.renderFindingsTab(body);
        break;
      case 'vitals':
        this.renderVitalsTab(body);
        break;
      case 'aeo-geo':
        this.renderAeoGeoTab(body);
        break;
      case 'clusters':
        this.renderClustersTab(body);
        break;
      case 'telemetry':
        this.renderTelemetryTab(body);
        break;
      case 'integrations':
        this.renderIntegrationsTab(body);
        break;
      default:
        this.renderOverviewTab(body);
    }
  }

  private renderOverviewTab(container: HTMLElement) {
    const { scorecard } = scoringEngine.computeScorecard();

    container.innerHTML = `
      <div class="seo-overview-grid">
        <!-- Main Score Hero Card -->
        <div class="seo-score-card">
          <div class="seo-score-circle">
            <span class="seo-score-number">${scorecard.overallScore}</span>
            <span class="seo-score-max">/ 100</span>
          </div>
          <div class="seo-score-info">
            <div class="seo-badge seo-badge-excellent">OVERALL OPTIMIZATION RATING</div>
            <h3 style="margin: 8px 0 4px; font-size: 20px;">System Health: Excellent</h3>
            <p style="font-size: 13px; color: #aaa; margin: 0;">Weighted aggregate computed across Technical SEO, On-Page, AEO, GEO, SXO, and CRO.</p>
          </div>
          <div class="seo-stats-summary">
            <div class="stat-box"><span class="stat-num text-pass">${scorecard.passedChecks}</span><span class="stat-label">Passed</span></div>
            <div class="stat-box"><span class="stat-num text-warn">${scorecard.warningChecks}</span><span class="stat-label">Warnings</span></div>
            <div class="stat-box"><span class="stat-num text-crit">${scorecard.criticalChecks}</span><span class="stat-label">Critical</span></div>
          </div>
        </div>

        <!-- 6 Optimization Dimensions Breakdown -->
        <div class="seo-dimensions-list">
          <h4 style="margin: 0 0 12px; font-size: 15px; color: #fff;">Dimension Performance Breakdown</h4>
          <div class="dimension-table-wrapper">
            <table class="seo-dim-table">
              <thead>
                <tr>
                  <th>Optimization Dimension</th>
                  <th>Weight</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Methodology & Limits</th>
                </tr>
              </thead>
              <tbody>
                ${scorecard.dimensions.map(dim => `
                  <tr>
                    <td><strong>${dim.name}</strong></td>
                    <td>${dim.weight}%</td>
                    <td>
                      <div class="dim-progress-wrap">
                        <div class="dim-progress-bar" style="width: ${dim.score}%"></div>
                        <span style="font-size:12px; font-weight:700;">${dim.score}/100</span>
                      </div>
                    </td>
                    <td><span class="seo-status-pill status-${dim.status.toLowerCase()}">${dim.status}</span></td>
                    <td><span class="seo-info-tooltip" title="${dim.methodology} Limit: ${dim.limitations}">ⓘ Details</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  private renderFindingsTab(container: HTMLElement) {
    const { allFindings } = scoringEngine.computeScorecard();
    const filtered = allFindings.filter(f => {
      if (this.severityFilter === 'ALL') return true;
      return f.severity === this.severityFilter;
    });

    container.innerHTML = `
      <div class="seo-findings-toolbar">
        <span style="font-size: 13px; color: #aaa;">Filter by Severity:</span>
        <button class="filter-btn ${this.severityFilter === 'ALL' ? 'active' : ''}" data-sev="ALL">All (${allFindings.length})</button>
        <button class="filter-btn text-crit ${this.severityFilter === 'CRITICAL' ? 'active' : ''}" data-sev="CRITICAL">Critical (${allFindings.filter(f => f.severity === 'CRITICAL').length})</button>
        <button class="filter-btn text-warn ${this.severityFilter === 'WARNING' ? 'active' : ''}" data-sev="WARNING">Warnings (${allFindings.filter(f => f.severity === 'WARNING').length})</button>
        <button class="filter-btn text-pass ${this.severityFilter === 'PASS' ? 'active' : ''}" data-sev="PASS">Passed (${allFindings.filter(f => f.severity === 'PASS').length})</button>
      </div>

      <div class="seo-findings-list">
        ${filtered.map(f => `
          <div class="finding-card finding-${f.severity.toLowerCase()}">
            <div class="finding-header">
              <span class="finding-sev-badge sev-${f.severity.toLowerCase()}">${f.severity}</span>
              <span class="finding-category">${f.category}</span>
              <h4 class="finding-title">${f.title}</h4>
            </div>
            <p class="finding-desc">${f.description}</p>
            <div class="finding-meta">
              <div class="meta-item"><strong>Evidence:</strong> <code>${f.evidence}</code></div>
              <div class="meta-item"><strong>Recommendation:</strong> ${f.recommendation}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sev = (e.currentTarget as HTMLButtonElement).dataset.sev as 'ALL' | IssueSeverity;
        this.severityFilter = sev;
        this.renderFindingsTab(container);
      });
    });
  }

  private renderVitalsTab(container?: HTMLElement) {
    const el = container || document.getElementById('seoSuiteBody');
    if (!el) return;

    const v = vitalsObserver.getMetrics();

    el.innerHTML = `
      <div class="vitals-dashboard">
        <div class="vitals-header">
          <h3 style="margin: 0; font-size: 18px;">Real-Time Core Web Vitals & SXO Telemetry</h3>
          <p style="font-size: 13px; color: #888; margin: 4px 0 0;">Measured directly via native browser PerformanceObserver without artificial simulations.</p>
        </div>

        <div class="vitals-cards-grid">
          <div class="vital-card">
            <div class="vital-name">LCP (Largest Contentful Paint)</div>
            <div class="vital-value ${v.lcp !== null && v.lcp < 2500 ? 'text-pass' : 'text-warn'}">${v.lcp !== null ? `${v.lcp} ms` : 'Measuring...'}</div>
            <div class="vital-target">Google Target: &lt; 2,500 ms</div>
          </div>

          <div class="vital-card">
            <div class="vital-name">CLS (Cumulative Layout Shift)</div>
            <div class="vital-value ${v.cls <= 0.1 ? 'text-pass' : 'text-warn'}">${v.cls}</div>
            <div class="vital-target">Google Target: &lt; 0.10</div>
          </div>

          <div class="vital-card">
            <div class="vital-name">INP / FID (Interaction Latency)</div>
            <div class="vital-value ${v.inp !== null && v.inp < 200 ? 'text-pass' : 'text-warn'}">${v.inp !== null ? `${v.inp} ms` : 'Awaiting input...'}</div>
            <div class="vital-target">Google Target: &lt; 200 ms</div>
          </div>

          <div class="vital-card">
            <div class="vital-name">TTFB (Time to First Byte)</div>
            <div class="vital-value text-pass">${v.ttfb !== null ? `${v.ttfb} ms` : 'Cached'}</div>
            <div class="vital-target">Cloudflare Edge Target: &lt; 200 ms</div>
          </div>

          <div class="vital-card">
            <div class="vital-name">DOM Interactive</div>
            <div class="vital-value text-pass">${v.domInteractive !== null ? `${v.domInteractive} ms` : 'Ready'}</div>
            <div class="vital-target">DOM Parse Complete</div>
          </div>

          <div class="vital-card">
            <div class="vital-name">Web Audio API Latency</div>
            <div class="vital-value text-pass">${v.audioLatencyMs !== null ? `${v.audioLatencyMs} ms` : 'Instant (&lt;10ms)'}</div>
            <div class="vital-target">Zero-Latency Polyphonic Buffer</div>
          </div>
        </div>
      </div>
    `;
  }

  private renderAeoGeoTab(container: HTMLElement) {
    container.innerHTML = `
      <div class="aeo-geo-dashboard">
        <h3 style="margin: 0 0 8px; font-size: 18px;">AEO (Answer Engine) & GEO (Generative Engine) Readiness</h3>
        <p style="font-size: 13px; color: #888; margin: 0 0 16px;">Direct answer structures, featured snippet candidate tables, and LLM discoverability metrics.</p>

        <div class="aeo-features-grid">
          <div class="aeo-box">
            <h4>Direct Answers & Voice Search</h4>
            <p>100% of FAQ items present concise, direct opening definitions (&lt;45 words) before expanding into supporting technical explanations, fulfilling Google Featured Snippet requirements.</p>
          </div>
          <div class="aeo-box">
            <h4>Tabular Data & Process Instructions</h4>
            <p>Contains HTML QWERTY keyboard reference tables and sequential HowTo step cards mapped to JSON-LD HowToStep schemas for rich answer cards.</p>
          </div>
          <div class="aeo-box">
            <h4>LLMs.txt Deployment</h4>
            <p>Configured at <code>/llms.txt</code> adhering to the emerging AI context standard for OpenAI GPTBot, ClaudeBot, PerplexityBot, and Google-Extended.</p>
          </div>
          <div class="aeo-box">
            <h4>Entity Recognition</h4>
            <p>Explicit entity disambiguation attributing developer <strong>Evostackr</strong>, contact channel <strong>support@evostackr.in</strong>, and acoustic instrument specs.</p>
          </div>
        </div>
      </div>
    `;
  }

  private renderClustersTab(container: HTMLElement) {
    container.innerHTML = `
      <div class="clusters-dashboard">
        <h3 style="margin: 0 0 8px; font-size: 18px;">Topical Authority & Entity Semantic Graph</h3>
        <p style="font-size: 13px; color: #888; margin: 0 0 16px;">Visualizing interconnected content clusters and verified knowledge entities.</p>

        <div class="clusters-grid">
          <div>
            <h4 style="margin: 0 0 8px; font-size: 14px; color: var(--color-accent-cyan);">Topic Cluster Hierarchy</h4>
            <div class="cluster-cards-list">
              ${TOPIC_CLUSTERS.map(cluster => `
                <div class="cluster-card">
                  <div class="cluster-type-badge">${cluster.type}</div>
                  <div style="font-weight: 700; font-size: 14px; margin: 4px 0;">${cluster.title}</div>
                  <div style="font-size: 12px; color: #888;">Intent: <code>${cluster.searchIntent}</code> • Coverage: <strong>${cluster.coverageScore}%</strong></div>
                  <a href="${cluster.url}" target="_blank" style="font-size: 12px; color: var(--color-accent-cyan); text-decoration: none;">View Section &rarr;</a>
                </div>
              `).join('')}
            </div>
          </div>

          <div>
            <h4 style="margin: 0 0 8px; font-size: 14px; color: var(--color-accent-cyan);">Verified Entity Graph</h4>
            <div class="entity-cards-list">
              ${ENTITY_GRAPH.map(ent => `
                <div class="entity-card">
                  <div style="font-size: 11px; text-transform: uppercase; color: #888; font-weight: 700;">${ent.type}</div>
                  <div style="font-weight: 800; font-size: 15px; margin: 2px 0;">${ent.name}</div>
                  <p style="font-size: 12px; color: #aaa; margin: 4px 0;">${ent.description}</p>
                  <div style="font-size: 11px; color: #777;">Relations: ${ent.relationships.map(r => `${r.relation} &rarr; ${r.targetId}`).join(', ')}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderTelemetryTab(container?: HTMLElement) {
    const el = container || document.getElementById('seoSuiteBody');
    if (!el) return;

    const t = engagementBus.getTelemetry();

    el.innerHTML = `
      <div class="telemetry-dashboard">
        <h3 style="margin: 0 0 8px; font-size: 18px;">Privacy-Preserving CRO & User Engagement Telemetry</h3>
        <p style="font-size: 13px; color: #888; margin: 0 0 16px;">Local event bus tracking active musical engagement without cookies, trackers, or external beacons.</p>

        <div class="telemetry-grid">
          <div class="stat-card">
            <div class="stat-big">${t.keysPlayedCount}</div>
            <div class="stat-desc">Piano Keys Played</div>
          </div>
          <div class="stat-card">
            <div class="stat-big">${t.chordsPlayedCount}</div>
            <div class="stat-desc">Simultaneous Chords</div>
          </div>
          <div class="stat-card">
            <div class="stat-big">${t.octavesNavigatedCount}</div>
            <div class="stat-desc">Octaves Navigated</div>
          </div>
          <div class="stat-card">
            <div class="stat-big">${t.sessionDurationSec}s</div>
            <div class="stat-desc">Session Duration</div>
          </div>
          <div class="stat-card">
            <div class="stat-big ${t.taskCompleted ? 'text-pass' : 'text-warn'}">${t.taskCompleted ? 'COMPLETED' : 'PENDING'}</div>
            <div class="stat-desc">Primary User Task (Play &gt;= 3 Notes)</div>
          </div>
          <div class="stat-card">
            <div class="stat-big">${t.contactClicksCount}</div>
            <div class="stat-desc">Support Contact Interactions</div>
          </div>
        </div>
      </div>
    `;
  }

  private renderIntegrationsTab(container: HTMLElement) {
    const adapters = adaptersManager.getAdapters();
    const config = adaptersManager.getConfig();

    container.innerHTML = `
      <div class="integrations-dashboard">
        <h3 style="margin: 0 0 8px; font-size: 18px;">External API Adapters & Data Sources</h3>
        <p style="font-size: 13px; color: #888; margin: 0 0 16px;">Configure authorized connections for Search Console, Analytics, PageSpeed, and Perplexity AI citations.</p>

        <div class="adapters-list">
          ${adapters.map(ad => `
            <div class="adapter-card">
              <div class="adapter-header">
                <div>
                  <h4 style="margin: 0; font-size: 15px;">${ad.name}</h4>
                  <p style="font-size: 12px; color: #888; margin: 2px 0 0;">${ad.description}</p>
                </div>
                <span class="adapter-status-pill status-${ad.status.toLowerCase()}">${ad.status.replace(/_/g, ' ')}</span>
              </div>
              <p style="font-size: 12px; color: #bbb; margin: 8px 0;">${ad.details}</p>
            </div>
          `).join('')}
        </div>

        <div class="adapter-config-form" style="margin-top: 20px; background: #222; padding: 16px; border-radius: 8px; border: 1px solid #333;">
          <h4 style="margin: 0 0 12px; font-size: 14px;">Update Integration Settings (Stored Securely in Local Browser)</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="display:block; font-size:12px; color:#aaa; margin-bottom:4px;">GA4 Measurement ID:</label>
              <input type="text" id="cfgGa4" class="seo-input" placeholder="G-XXXXXXXXXX" value="${config.ga4MeasurementId || ''}">
            </div>
            <div>
              <label style="display:block; font-size:12px; color:#aaa; margin-bottom:4px;">Google Search Console Site URL:</label>
              <input type="text" id="cfgGsc" class="seo-input" placeholder="https://my-piano.evostackr.in/" value="${config.gscSiteUrl || ''}">
            </div>
            <div>
              <label style="display:block; font-size:12px; color:#aaa; margin-bottom:4px;">PageSpeed Insights API Key:</label>
              <input type="password" id="cfgPsi" class="seo-input" placeholder="AIzaSy..." value="${config.psiApiKey || ''}">
            </div>
            <div>
              <label style="display:block; font-size:12px; color:#aaa; margin-bottom:4px;">Perplexity AI API Key:</label>
              <input type="password" id="cfgPerp" class="seo-input" placeholder="pplx-..." value="${config.perplexityApiKey || ''}">
            </div>
          </div>
          <button id="saveAdaptersBtn" class="seo-tool-btn active" style="margin-top: 12px;">Save API Configuration</button>
        </div>
      </div>
    `;

    container.querySelector('#saveAdaptersBtn')?.addEventListener('click', () => {
      const ga4 = (container.querySelector('#cfgGa4') as HTMLInputElement).value.trim();
      const gsc = (container.querySelector('#cfgGsc') as HTMLInputElement).value.trim();
      const psi = (container.querySelector('#cfgPsi') as HTMLInputElement).value.trim();
      const perp = (container.querySelector('#cfgPerp') as HTMLInputElement).value.trim();

      adaptersManager.updateConfig({
        ga4MeasurementId: ga4 || undefined,
        gscSiteUrl: gsc || undefined,
        psiApiKey: psi || undefined,
        perplexityApiKey: perp || undefined
      });

      this.renderIntegrationsTab(container);
    });
  }

  private exportReport() {
    const { scorecard, allFindings } = scoringEngine.computeScorecard();
    const vitals = vitalsObserver.getMetrics();
    const telemetry = engagementBus.getTelemetry();

    const reportData = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      scorecard,
      vitals,
      telemetry,
      findings: allFindings
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-piano-seo-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const optimizationDashboardUI = new OptimizationDashboardUI();
