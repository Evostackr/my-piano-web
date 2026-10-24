import { WebVitalsMetrics } from './types';

/**
 * Real-Time SXO & Core Web Vitals Monitor
 * Uses standard PerformanceObserver and Navigation Timing APIs.
 * Zero fabricated data; reports actual browser measurements.
 */
export class VitalsObserver {
  private metrics: WebVitalsMetrics = {
    ttfb: null,
    fcp: null,
    lcp: null,
    cls: 0,
    inp: null,
    domInteractive: null,
    audioLatencyMs: null
  };

  private observersStarted = false;
  private subscribers: Array<(metrics: WebVitalsMetrics) => void> = [];

  constructor() {
    this.initMetrics();
  }

  public subscribe(callback: (metrics: WebVitalsMetrics) => void): () => void {
    this.subscribers.push(callback);
    callback({ ...this.metrics });
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  public getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }

  public setAudioLatency(latencyMs: number) {
    this.metrics.audioLatencyMs = Math.round(latencyMs * 10) / 10;
    this.notifySubscribers();
  }

  private notifySubscribers() {
    const clone = { ...this.metrics };
    this.subscribers.forEach(cb => cb(clone));
  }

  private initMetrics() {
    if (typeof window === 'undefined' || typeof performance === 'undefined') return;

    // 1. Navigation Timing (TTFB, DOM Interactive)
    try {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries && navEntries.length > 0) {
        const nav = navEntries[0];
        if (nav.responseStart > 0 && nav.requestStart > 0) {
          this.metrics.ttfb = Math.round(nav.responseStart - nav.requestStart);
        }
        if (nav.domInteractive > 0) {
          this.metrics.domInteractive = Math.round(nav.domInteractive);
        }
      }
    } catch {
      // Ignored if navigation timing API is restricted
    }

    if (this.observersStarted) return;
    this.observersStarted = true;

    // 2. First Contentful Paint (FCP)
    try {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = Math.round(entry.startTime);
        }
      });

      const paintObserver = new PerformanceObserver(entryList => {
        entryList.getEntries().forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = Math.round(entry.startTime);
            this.notifySubscribers();
          }
        });
      });
      paintObserver.observe({ type: 'paint', buffered: true });
    } catch {
      // PerformanceObserver may not support 'paint' in some environments
    }

    // 3. Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          this.metrics.lcp = Math.round(lastEntry.startTime);
          this.notifySubscribers();
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // Ignored
    }

    // 4. Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(entryList => {
        for (const entry of entryList.getEntries()) {
          // Only count shifts without recent user input
          const layoutShift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
          if (!layoutShift.hadRecentInput && typeof layoutShift.value === 'number') {
            clsValue += layoutShift.value;
            this.metrics.cls = Math.round(clsValue * 1000) / 1000;
            this.notifySubscribers();
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // Ignored
    }

    // 5. Interaction to Next Paint (INP) / First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver(entryList => {
        for (const entry of entryList.getEntries()) {
          const firstInput = entry as PerformanceEntry & { processingStart?: number };
          if (typeof firstInput.processingStart === 'number') {
            this.metrics.inp = Math.round(firstInput.processingStart - firstInput.startTime);
            this.notifySubscribers();
          }
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch {
      // Ignored
    }
  }
}

export const vitalsObserver = new VitalsObserver();
