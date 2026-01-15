import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputSystem } from './InputSystem';

// Mock Phaser (Minimal needed for InputSystem)
vi.mock('phaser', () => {
    return {
        default: {
            Math: {
                Vector2: class {
                    x = 0; y = 0;
                    constructor(x: number = 0, y: number = 0) { this.x = x; this.y = y; }
                    set(x: number, y: number) { this.x = x; this.y = y; return this; }
                    angle() { return Math.atan2(this.y, this.x); }
                }
            },
            Scene: class { }
        }
    }
});

describe('InputSystem', () => {
    let inputSystem: InputSystem;
    let mockScene: any;

    beforeEach(() => {
        mockScene = {
            time: { now: 1000 },
            events: { emit: vi.fn(), on: vi.fn(), off: vi.fn() }
        };
        inputSystem = new InputSystem(mockScene);
    });

    it('should initialization with zero vector', () => {
        const axis = inputSystem.getVirtualAxis();
        expect(axis.x).toBe(0);
        expect(axis.y).toBe(0);
    });

    it('should update virtual axis when setVirtualAxis is called', () => {
        inputSystem.setVirtualAxis(0.5, -0.5);
        const axis = inputSystem.getVirtualAxis();
        expect(axis.x).toBe(0.5);
        expect(axis.y).toBe(-0.5);
    });

    // [FIX] Flick-to-Dash is currently DISABLED in InputSystem (commented out for MVP)
    // These tests are updated to reflect current behavior
    it('should NOT emit PLAYER_DASH on flick (feature disabled)', () => {
        // 1. Pull joystick (Time: 1000)
        mockScene.time.now = 1000;
        inputSystem.setVirtualAxis(0.8, 0); // High magnitude

        // 2. Release quickly (Time: 1050, within 100ms)
        mockScene.time.now = 1050;
        inputSystem.setVirtualAxis(0, 0);

        // Dash is disabled, so no event should be emitted
        expect(mockScene.events.emit).not.toHaveBeenCalledWith('PLAYER_DASH', expect.any(Object));
    });

    it('should NOT emit dash if release is too slow (feature disabled anyway)', () => {
        // 1. Pull joystick
        mockScene.time.now = 1000;
        inputSystem.setVirtualAxis(0.8, 0);

        // 2. Release slowly (Time: 1200, > 100ms)
        mockScene.time.now = 1200;
        inputSystem.setVirtualAxis(0, 0);

        expect(mockScene.events.emit).not.toHaveBeenCalledWith('PLAYER_DASH', expect.any(Object));
    });
});
