import Phaser from 'phaser';

export interface InputFrame {
    tick: number;
    dx: number;
    dy: number;
    actions: string[]; // 'FIRE', 'DASH'
}

export class InputRecorder {
    private buffers: InputFrame[] = [];
    private playbackMode: boolean = false;
    private playbackIndex: number = 0;

    constructor() { }

    private readonly MAX_FRAMES = 60 * 60 * 10; // ~10 Minutes @ 60fps

    public record(tick: number, dx: number, dy: number, fire: boolean, dash: boolean) {
        if (this.playbackMode) return;

        const actions: string[] = [];
        if (fire) actions.push('FIRE');
        if (dash) actions.push('DASH');

        this.buffers.push({
            tick,
            dx, // Fix: Use shorthand
            dy,
            actions
        });

        // [FIX] Circular Buffer Protection
        if (this.buffers.length > this.MAX_FRAMES) {
            this.buffers.shift();
        }
    }

    public getPlayback(tick: number): InputFrame | null {
        if (!this.playbackMode) return null;

        // Simple linear search or index tracking matching tick
        // Assuming lockstep tick match
        if (this.playbackIndex < this.buffers.length) {
            const frame = this.buffers[this.playbackIndex];
            if (frame.tick === tick) {
                this.playbackIndex++;
                return frame;
            }
        }
        return null;
    }

    public exportSession(): string {
        return JSON.stringify(this.buffers);
    }

    public loadSession(json: string) {
        this.buffers = JSON.parse(json);
        this.playbackMode = true;
        this.playbackIndex = 0;
        console.log(`[InputRecorder] Loaded ${this.buffers.length} frames.`);
    }
}
