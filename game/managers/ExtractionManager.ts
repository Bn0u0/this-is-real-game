import Phaser from 'phaser';
import { ExtractionZone } from '../classes/ExtractionZone';
import { Player } from '../classes/Player';
import { EventBus } from '../../services/EventBus';

export enum ExtractionState {
    CLOSED = 'CLOSED',
    WARNING = 'WARNING',
    OPEN = 'OPEN'
}

export class ExtractionManager {
    private scene: Phaser.Scene;
    private zones: Phaser.GameObjects.Group;
    public worldWidth: number;
    public worldHeight: number;
    private terrainManager?: any;

    // State Machine
    public state: ExtractionState = ExtractionState.CLOSED;
    private timer: number = 0;

    // Config (ms)
    private readonly CYCLE_DURATION = 180000; // 3 mins total
    private readonly WARNING_START = 150000;  // 2:30
    private readonly OPEN_START = 170000;     // 2:50 (10s window)

    constructor(scene: Phaser.Scene, worldWidth: number, worldHeight: number) {
        this.scene = scene;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.zones = scene.add.group({ classType: ExtractionZone, runChildUpdate: false });
    }

    public setTerrainManager(tm: any) {
        this.terrainManager = tm;
    }

    public update(time: number, delta: number) {
        this.timer += delta;

        // Reset Cycle
        if (this.timer >= this.CYCLE_DURATION) {
            this.timer = 0;
            this.setState(ExtractionState.CLOSED);
            EventBus.emit('EXTRACTION_CYCLE_RESET');
        }
        // State Transitions
        else if (this.state === ExtractionState.CLOSED && this.timer >= this.WARNING_START) {
            this.setState(ExtractionState.WARNING);
        }
        else if (this.state === ExtractionState.WARNING && this.timer >= this.OPEN_START) {
            this.setState(ExtractionState.OPEN);
        }

        // Visual Updates
        if (this.state === ExtractionState.WARNING) {
            // Flicker effect or ghost zone logic could go here
        }
    }

    private setState(newState: ExtractionState) {
        if (this.state === newState) return;
        this.state = newState;

        console.log(`[Extraction] State: ${newState}`);
        EventBus.emit('EXTRACTION_STATE_CHANGE', newState);

        if (newState === ExtractionState.OPEN) {
            this.spawnZones();
        } else if (newState === ExtractionState.CLOSED) {
            this.zones.clear(true, true);
        }
    }

    public spawnZones() {
        this.zones.clear(true, true);

        // Try to find 2 safe spots
        for (let i = 0; i < 2; i++) {
            let pos = { x: 0, y: 0 };
            if (this.terrainManager) {
                const tile = this.terrainManager.getRandomGroundTile();
                if (tile) pos = tile;
            } else {
                // Fallback
                pos = i === 0 ? { x: this.worldWidth - 300, y: 300 } : { x: 300, y: this.worldHeight - 300 };
            }

            const zone = new ExtractionZone(this.scene, pos.x, pos.y);
            this.zones.add(zone);

            // Spawn Effect
            this.scene.tweens.add({
                targets: zone, scale: { from: 0, to: 1 }, duration: 500, ease: 'Back.out'
            });
        }
    }

    public checkExtraction(player: Player): boolean {
        if (this.state !== ExtractionState.OPEN) return false;

        let extracted = false;
        this.zones.getChildren().forEach((z: any) => {
            const zone = z as ExtractionZone;
            const dist = Phaser.Math.Distance.Between(player.x, player.y, zone.x, zone.y);
            const inZone = dist < 100;

            if (zone.updateProgress(16.6, inZone)) {
                extracted = true;
            }
        });
        return extracted;
    }
}
