/**
 * Audio feedback utility for the QR Scanner.
 * Uses the Web Audio API to procedurally generate distinct beeps
 * without requiring external sound file assets.
 */

class AudioFeedback {
  private context: AudioContext | null = null;

  private getContext() {
    if (!this.context) {
      // Use the standard window.AudioContext or webkitAudioContext for Safari
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.context = new AudioCtx();
      }
    }
    return this.context;
  }

  /**
   * Plays a distinct "Scan Detected" beep
   */
  public playScanBeep() {
    const ctx = this.getContext();
    if (!ctx) return;
    
    // Resume context if suspended (browser autoplay policies)
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  /**
   * Plays a happy "Success" chord for check-in confirmation
   */
  public playSuccessBeep() {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playNote(523.25, now, 0.15); // C5
    playNote(659.25, now + 0.1, 0.3); // E5
  }

  /**
   * Plays a harsh "Error" buzzer
   */
  public playErrorBeep() {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }
}

export const scannerAudio = typeof window !== 'undefined' ? new AudioFeedback() : null;
