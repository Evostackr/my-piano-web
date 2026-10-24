import { ExternalAdapterInfo } from './types';

const ADAPTER_CONFIG_KEY = 'my_piano_seo_adapters_v1';

interface SavedAdapterConfig {
  ga4MeasurementId?: string;
  psiApiKey?: string;
  gscSiteUrl?: string;
  perplexityApiKey?: string;
}

/**
 * Standardized External Integration Adapters
 * Connects to external services without fabricating metrics or assuming unconfigured access.
 */
export class ExternalAdaptersManager {
  private config: SavedAdapterConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  public getAdapters(): ExternalAdapterInfo[] {
    const adapters: ExternalAdapterInfo[] = [
      {
        provider: 'GOOGLE_SEARCH_CONSOLE',
        name: 'Google Search Console (GSC)',
        status: this.config.gscSiteUrl ? 'CONNECTED' : 'API_KEY_REQUIRED',
        description: 'Pulls verified impressions, clicks, click-through rates, and average search positions from Google Search API.',
        details: this.config.gscSiteUrl
          ? `Site Property: ${this.config.gscSiteUrl}`
          : 'Pending configuration. Requires Google Cloud Service Account with Search Console read permissions.'
      },
      {
        provider: 'GOOGLE_ANALYTICS_4',
        name: 'Google Analytics 4 (GA4)',
        status: this.config.ga4MeasurementId ? 'CONNECTED' : 'API_KEY_REQUIRED',
        description: 'Integrates real user traffic, referral sources, engagement rate, and custom piano interaction events.',
        details: this.config.ga4MeasurementId
          ? `Measurement ID: ${this.config.ga4MeasurementId}`
          : 'Requires GA4 Data Stream Measurement ID (e.g., G-XXXXXXXXXX).'
      },
      {
        provider: 'PAGESPEED_INSIGHTS',
        name: 'Google PageSpeed Insights API',
        status: this.config.psiApiKey ? 'CONNECTED' : 'API_KEY_REQUIRED',
        description: 'Runs real-time laboratory Lighthouse audits and retrieves Chrome User Experience Report (CrUX) field data.',
        details: this.config.psiApiKey
          ? 'API Key configured. Ready to fetch live CrUX metrics.'
          : 'Requires Google Cloud API Key enabled for PageSpeed Insights API v5.'
      },
      {
        provider: 'PERPLEXITY_AI',
        name: 'Perplexity AI Search & Citations API',
        status: this.config.perplexityApiKey ? 'CONNECTED' : 'API_KEY_REQUIRED',
        description: 'Queries Perplexity Sonar models to monitor citations, brand mentions, and reference context in real-time generative search.',
        details: this.config.perplexityApiKey
          ? 'Perplexity API Key active.'
          : 'Requires Perplexity AI API Key (sonar-medium-online or sonar-reasoning).'
      }
    ];

    return adapters;
  }

  public updateConfig(newConfig: Partial<SavedAdapterConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  public getConfig(): SavedAdapterConfig {
    return { ...this.config };
  }

  private loadConfig(): SavedAdapterConfig {
    if (typeof localStorage === 'undefined') return {};
    try {
      const data = localStorage.getItem(ADAPTER_CONFIG_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveConfig() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(ADAPTER_CONFIG_KEY, JSON.stringify(this.config));
    } catch {
      // Ignored
    }
  }
}

export const adaptersManager = new ExternalAdaptersManager();
