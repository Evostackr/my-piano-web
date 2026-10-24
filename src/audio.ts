/**
 * Web Audio API Engine for Piano App
 * Provides low-latency polyphonic playback of the authentic .ogg note samples.
 */

class PianoAudioEngine {
  private ctx: AudioContext | null = null;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private loadingPromises: Map<string, Promise<AudioBuffer | null>> = new Map();
  private masterGain: GainNode | null = null;
  private volume: number = 0.85;
  private isMuted: boolean = false;
  private activeSources: Set<AudioBufferSourceNode> = new Set();

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public async preloadNotes(soundNames: string[]) {
    soundNames.forEach(sound => this.loadBuffer(sound));
  }

  public async loadBuffer(soundName: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(soundName)) {
      return this.bufferCache.get(soundName)!;
    }

    if (this.loadingPromises.has(soundName)) {
      return this.loadingPromises.get(soundName)!;
    }

    const promise = (async () => {
      try {
        const url = `/sounds/${soundName}.ogg`;
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Failed to fetch audio for ${soundName}: ${response.statusText}`);
          return null;
        }
        const arrayBuffer = await response.arrayBuffer();
        
        // Ensure context exists to decode audio data
        if (!this.ctx) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          this.ctx = new AudioContextClass();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
        }

        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.bufferCache.set(soundName, audioBuffer);
        return audioBuffer;
      } catch (err) {
        console.warn(`Error decoding audio for ${soundName}`, err);
        return null;
      } finally {
        this.loadingPromises.delete(soundName);
      }
    })();

    this.loadingPromises.set(soundName, promise);
    return promise;
  }

  public async playSound(soundName: string) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      let buffer = this.bufferCache.get(soundName);
      if (!buffer) {
        buffer = await this.loadBuffer(soundName) || undefined;
      }

      if (!buffer) {
        // Fallback to HTML5 audio element if decoding failed
        const fallbackAudio = new Audio(`/sounds/${soundName}.ogg`);
        fallbackAudio.volume = this.isMuted ? 0 : this.volume;
        fallbackAudio.play().catch(() => {});
        return;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      // Create a dedicated note gain for fine volume control and zero-click ending
      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      source.connect(noteGain);
      noteGain.connect(this.masterGain);

      this.activeSources.add(source);
      source.onended = () => {
        this.activeSources.delete(source);
        source.disconnect();
        noteGain.disconnect();
      };

      source.start(0);
    } catch (e) {
      console.error(`Error playing sound: ${soundName}`, e);
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public stopAll() {
    this.activeSources.forEach(src => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // Ignored
      }
    });
    this.activeSources.clear();
  }
}

export const audioEngine = new PianoAudioEngine();
