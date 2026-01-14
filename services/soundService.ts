class SoundService {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext() {
    if (!this.enabled) return null;
    try {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    } catch (e) {
        console.error("AudioContext not supported", e);
        return null;
    }
  }

  // C Major Arpeggio - Happy sound
  playCorrect() {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    
    this.beep(523.25, t, 0.1, 'sine'); // C5
    this.beep(659.25, t + 0.1, 0.1, 'sine'); // E5
    this.beep(783.99, t + 0.2, 0.2, 'sine'); // G5
  }

  // Low Sawtooth - Error sound
  playIncorrect() {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.4);
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  // Victory Fanfare
  playComplete() {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    
    // Quick fanfare pattern
    this.beep(523.25, t, 0.1, 'square', 0.1); // C5
    this.beep(523.25, t + 0.15, 0.1, 'square', 0.1); // C5
    this.beep(523.25, t + 0.3, 0.1, 'square', 0.1); // C5
    this.beep(783.99, t + 0.45, 0.6, 'square', 0.1); // G5
  }

  // High ping for UI interactions or XP
  playXp() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.beep(1046.50, ctx.currentTime, 0.1, 'sine', 0.05); // C6
  }

  // Click sound
  playClick() {
     const ctx = this.getContext();
     if (!ctx) return;
     const t = ctx.currentTime;
     this.beep(800, t, 0.03, 'triangle', 0.05);
  }

  private beep(freq: number, startTime: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  toggle(on: boolean) {
      this.enabled = on;
  }
}

export const soundService = new SoundService();
