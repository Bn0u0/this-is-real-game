export class SoundManager {
    private ctx: AudioContext;
    private masterGain: GainNode;

    constructor() {
        // Init AudioContext on user interaction usually, but we prep it here
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Prevent ear damage
        this.masterGain.connect(this.ctx.destination);
    }

    public resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public playShoot() {
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Pew Pew - Fast frequency drop
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.1);
    }

    public playHit() {
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Crunch - Noise approximation via randomized waves or low square
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.1);
    }

    public playCollect() {
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Ping - High sine
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(1800, t + 0.1);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.2);
    }

    public startBGM() {
        this.resume();
        // Simple Bassline Sequencer
        let note = 0;
        setInterval(() => {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            const freq = note % 2 === 0 ? 110 : 55; // A2 / A1
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

            // Filter
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400 + Math.sin(t) * 200;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start(t);
            osc.stop(t + 0.2);

            note++;
        }, 250); // 240 BPM eighth notes
    }
}
