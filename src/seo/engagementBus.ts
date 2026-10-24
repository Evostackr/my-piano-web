import { EngagementTelemetry } from './types';

const STORAGE_KEY = 'my_piano_telemetry_v1';

/**
 * Privacy-Preserving SXO & CRO Engagement Telemetry Bus
 * Measures real user task completion and interaction without cookies or external surveillance.
 */
export class EngagementBus {
  private telemetry: EngagementTelemetry;
  private sessionStartTime: number;
  private subscribers: Array<(data: EngagementTelemetry) => void> = [];

  constructor() {
    this.sessionStartTime = Date.now();
    this.telemetry = this.loadPersistedTelemetry();

    // Start timer to update session duration
    if (typeof window !== 'undefined') {
      window.setInterval(() => {
        const currentDuration = Math.round((Date.now() - this.sessionStartTime) / 1000);
        this.telemetry.sessionDurationSec = currentDuration;
        this.saveTelemetry();
        this.notifySubscribers();
      }, 5000);
    }
  }

  public subscribe(callback: (data: EngagementTelemetry) => void): () => void {
    this.subscribers.push(callback);
    callback({ ...this.telemetry });
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  public getTelemetry(): EngagementTelemetry {
    return { ...this.telemetry };
  }

  public recordKeyPlayed() {
    this.telemetry.keysPlayedCount++;
    if (this.telemetry.keysPlayedCount >= 3) {
      this.telemetry.taskCompleted = true; // Actively played the instrument
    }
    this.saveTelemetry();
    this.notifySubscribers();
  }

  public recordChordPlayed() {
    this.telemetry.chordsPlayedCount++;
    this.telemetry.taskCompleted = true;
    this.saveTelemetry();
    this.notifySubscribers();
  }

  public recordOctaveNavigated() {
    this.telemetry.octavesNavigatedCount++;
    this.saveTelemetry();
    this.notifySubscribers();
  }

  public recordShortcutToggle() {
    this.telemetry.shortcutsToggledCount++;
    this.saveTelemetry();
    this.notifySubscribers();
  }

  public recordFullscreenToggle() {
    this.telemetry.fullscreenToggledCount++;
    this.saveTelemetry();
    this.notifySubscribers();
  }

  public recordHelpViewed() {
    this.telemetry.helpViewedCount++;
    this.saveTelemetry();
    this.notifySubscribers();
  }

  public recordContactClick() {
    this.telemetry.contactClicksCount++;
    this.saveTelemetry();
    this.notifySubscribers();
  }

  public resetSession() {
    this.telemetry = {
      sessionDurationSec: 0,
      keysPlayedCount: 0,
      chordsPlayedCount: 0,
      octavesNavigatedCount: 0,
      shortcutsToggledCount: 0,
      fullscreenToggledCount: 0,
      helpViewedCount: 0,
      contactClicksCount: 0,
      taskCompleted: false
    };
    this.sessionStartTime = Date.now();
    this.saveTelemetry();
    this.notifySubscribers();
  }

  private saveTelemetry() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.telemetry));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  private loadPersistedTelemetry(): EngagementTelemetry {
    const defaults: EngagementTelemetry = {
      sessionDurationSec: 0,
      keysPlayedCount: 0,
      chordsPlayedCount: 0,
      octavesNavigatedCount: 0,
      shortcutsToggledCount: 0,
      fullscreenToggledCount: 0,
      helpViewedCount: 0,
      contactClicksCount: 0,
      taskCompleted: false
    };

    if (typeof localStorage === 'undefined') return defaults;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed };
      }
    } catch {
      // Fallback
    }

    return defaults;
  }

  private notifySubscribers() {
    const clone = { ...this.telemetry };
    this.subscribers.forEach(cb => cb(clone));
  }
}

export const engagementBus = new EngagementBus();
