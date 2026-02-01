import Phaser from 'phaser';
import { EventBus } from '../services/EventBus';
import { ArtLabState, DEFAULT_LAB_CONFIG } from './ArtLabConfig';
import { generateCharacterTextures, generateSpriteSheet, generateWeaponIcons } from '../game/phaser/generators/TextureGenerator';
import { CharacterMode } from './modes/CharacterMode';
import { WeaponMode } from './modes/WeaponMode';
import { EnemyTestMode } from './modes/EnemyTestMode';

export class ArtLabScene extends Phaser.Scene {
    private config: ArtLabState = DEFAULT_LAB_CONFIG;
    private grid!: Phaser.GameObjects.Graphics;

    // Modes
    private charMode: CharacterMode;
    private weaponMode: WeaponMode;
    private enemyTestMode: EnemyTestMode;

    constructor() {
        super('ArtLabScene');
        this.charMode = new CharacterMode(this);
        this.weaponMode = new WeaponMode(this);
        this.enemyTestMode = new EnemyTestMode(this);
    }

    // Debug
    private debugText: Phaser.GameObjects.Text | null = null;

    create() {
        console.log("🧪 [Art Lab] Scene Created");

        // 0. Generate Textures (Procedural)
        generateCharacterTextures(this);
        generateSpriteSheet(this);
        generateWeaponIcons(this);

        // 1. Setup Grid Background
        this.grid = this.add.graphics();
        this.drawGrid();

        // 2. Initialize Modes
        this.charMode.create();
        this.weaponMode.create();
        this.enemyTestMode.create();

        // Bind enemy test mode to character position
        const charSprite = (this.charMode as any).characterSprite;
        if (charSprite) {
            this.enemyTestMode.bindToPlayer(charSprite);
        }

        this.charMode.updateConfig(this.config);
        this.weaponMode.updateConfig(this.config);
        this.enemyTestMode.updateConfig(this.config);

        // 3. Listen for Config Updates
        const onUpdate = (newConfig: ArtLabState) => {
            console.log("🧪 [Art Lab] Event Received:", newConfig);
            this.config = newConfig;
            this.updateResolution();
            this.charMode.updateConfig(this.config);
            this.weaponMode.updateConfig(this.config);
            this.enemyTestMode.updateConfig(this.config);
            this.updateDebugText();
        };

        EventBus.on('ART_LAB_UPDATE', onUpdate);

        // Cleanup on Shutdown (Crucial for HMR / Restarting)
        this.events.once('shutdown', () => {
            EventBus.off('ART_LAB_UPDATE', onUpdate);
            console.log("🧪 [Art Lab] Event Listeners Cleaned Up");
        });

        // 4. Initial Resolution Setup
        this.updateResolution();

        // 5. Handle Resize
        this.scale.on('resize', this.drawGrid, this);

        // 6. Debug Text
        this.debugText = this.add.text(10, 10, '', {
            font: '16px monospace', color: '#00ff00', backgroundColor: '#000000'
        });
        this.debugText.setScrollFactor(0); // Fixed on screen
        this.updateDebugText();
    }

    update(time: number, delta: number) {
        // Delegate to Active Mode
        if (this.config.activeMode === 'CHARACTER') {
            this.charMode.update(time, delta);
        } else if (this.config.activeMode === 'WEAPON') {
            this.weaponMode.update(time, delta);
        }

        // Always update enemy test mode if enabled
        if (this.config.enableEnemyTest) {
            this.enemyTestMode.update(time, delta);
        }
    }

    private updateDebugText() {
        if (!this.debugText) return;
        this.debugText.setText(
            `ZOOM: ${this.config.cameraZoom.toFixed(1)}\n` +
            `WOBBLE: ${this.config.wobbleSpeed.toFixed(1)}\n` +
            `SCALE: ${this.config.charScaleX.toFixed(1)}`
        );
    }

    private updateResolution() {
        if (!this.cameras.main) return;
        this.cameras.main.setZoom(this.config.cameraZoom);
        this.cameras.main.centerOn(0, 0);
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
