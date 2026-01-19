import Phaser from 'phaser';
import { EventBus } from '../services/EventBus';
import { ArtLabState, DEFAULT_LAB_CONFIG } from './ArtLabConfig';
import { CharacterMode } from './modes/CharacterMode';

export class ArtLabScene extends Phaser.Scene {
    private config: ArtLabState = DEFAULT_LAB_CONFIG;
    private grid!: Phaser.GameObjects.Graphics;

    // Modes
    private charMode: CharacterMode;
    // WeaponMode, etc.

    constructor() {
        super('ArtLabScene');
        this.charMode = new CharacterMode(this);
    }

    create() {
        console.log("🧪 [Art Lab] Scene Created");

        // 1. Setup Grid Background
        this.grid = this.add.graphics();
        this.drawGrid();

        // 2. Initialize Modes
        this.charMode.create();

        // 3. Listen for Config Updates
        EventBus.on('ART_LAB_UPDATE', (newConfig: ArtLabState) => {
            this.config = newConfig;
            this.updateResolution();
            this.charMode.updateConfig(this.config);
        });

        // 4. Initial Resolution Setup
        this.updateResolution();

        // 5. Handle Resize
        this.scale.on('resize', this.drawGrid, this);
    }

    update(time: number, delta: number) {
        // Delegate to Active Mode
        if (this.config.activeMode === 'CHARACTER') {
            this.charMode.update(time, delta);
        }
    }

    private updateResolution() {
        // [PIXELATION PIPELINE]
        // Instead of resizing global canvas, we zoom the camera to simulate low res
        const zoom = this.config.pixelation;
        this.cameras.main.setZoom(zoom);
        this.cameras.main.centerOn(0, 0); // Always focus center
    }

    private drawGrid() {
        this.grid.clear();
        this.grid.lineStyle(2, 0x333333);

        // Draw centered crosshair
        this.grid.beginPath();
        this.grid.moveTo(-1000, 0);
        this.grid.lineTo(1000, 0);
        this.grid.moveTo(0, -1000);
        this.grid.lineTo(0, 1000);
        this.grid.strokePath();

        // Draw 100px grid
        this.grid.lineStyle(1, 0x1a1a1a);
        for (let i = -500; i <= 500; i += 50) {
            this.grid.strokeRect(i, -500, 0.5, 1000); // Vertical
            this.grid.strokeRect(-500, i, 1000, 0.5); // Horizontal
        }
    }
}
