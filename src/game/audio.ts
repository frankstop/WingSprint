export type SoundName = "flap" | "score" | "impact" | "result";

export class AudioManager {
  private context?: AudioContext;

  constructor(private muted: boolean) {}

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  async unlock(): Promise<void> {
    if (!this.context) this.context = new AudioContext();
    if (this.context.state === "suspended") await this.context.resume();
  }

  play(name: SoundName): void {
    if (this.muted || !this.context) return;
    const tones: Record<SoundName, [number, number, number]> = {
      flap: [420, 610, 0.055],
      score: [720, 980, 0.08],
      impact: [150, 70, 0.16],
      result: [440, 660, 0.2]
    };
    const [start, end, duration] = tones[name];
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = name === "impact" ? "square" : "triangle";
    oscillator.frequency.setValueAtTime(start, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(end, this.context.currentTime + duration);
    gain.gain.setValueAtTime(0.0001, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, this.context.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }
}
