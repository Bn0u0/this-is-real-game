import Phaser from 'phaser';
import { EventBus } from '../../services/EventBus';
import { CameraDirector } from '../phaser/managers/CameraDirector';
import { sessionService } from '../../services/SessionService';
import { SafeArea } from '../phaser/utils/SafeArea';
import { languageService } from '../../services/LanguageService';

export class WorkbenchScene extends Phaser.Scene {
    private cameraDirector!: CameraDirector;

    // Interactive Zones
    private weaponCrate!: Phaser.GameObjects.Container;
    private heroStand!: Phaser.GameObjects.Container;
    private blueprints!: Phaser.GameObjects.Container;

    // State
    private currentFocus: 'NONE' | 'CRATE' | 'HERO' | 'DEPLOY' | 'BLUEPRINTS' = 'NONE';

    constructor() {
        super('WorkbenchScene');
    }

    preload() {
        // [REVERT] No images needed for abstract style
    }

    create() {
        console.log("🛠️ [WorkbenchScene] STARTING...");
        // [FIX] Pass 0,0 dimensions so CameraDirector.reset() centers on (0,0)
        // Workbench objects are placed around (0,0), so we want the camera centered there.
        this.cameraDirector = new CameraDirector(this, 0, 0);

        // 1. Setup Environment
        this.createEnvironment();

        // 2. Setup Zones (Portrait/Mobile Layout Forced)
        // Since App.tsx enforces a max-width and aspect ratio, we should always design for Portrait.
        // Layout: TRIANGLE 
        // Agent (Top), Arsenal (Bottom Left), Deploy (Bottom Right)

        // [CENTER/TOP] AGENT
        this.createInteractionZone(0, -120, 160, 220, 0x00FFFF, languageService.t('WB_HERO'), 'HERO');

        // [LEFT/BOTTOM-LEFT] ARSENAL
        this.createInteractionZone(-90, 100, 140, 180, 0xD4A017, languageService.t('HOME_BTN_ARSENAL'), 'CRATE');

        // [RIGHT/BOTTOM-RIGHT] DEPLOY - [REMOVED] Duplicate UI
        // this.createInteractionZone(90, 100, 140, 180, 0xFF4500, languageService.t('WB_GO'), 'DEPLOY');

        // 3. Input Setup
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, gameObjects: any[]) => {
            if (gameObjects.length === 0 && this.currentFocus !== 'NONE') {
                this.resetView(); // Click outside -> Back
            }
        });

        // 4. Initial Camera
        this.cameras.main.setZoom(0.6); // Slightly closer for mobile feel
        this.cameraDirector.reset(0);

        // 5. Listen for External Events
        EventBus.on('WORKBENCH_ACTION', (action: string) => {
            if (action === 'BACK') this.resetView();
        });

        // [FIX] Listen for React SCENE_SWITCH command
        EventBus.on('SCENE_SWITCH', (sceneName: string) => {
            console.log(`🔀 [WorkbenchScene] Switching to ${sceneName}...`);
            if (sceneName === 'MainScene') {
                this.scene.start('MainScene');
            }
        });

        // No resize listener needed if container is fixed, but harmless to keep if we supported dynamic resizing later.
        // For now, simpler is better.
    }

    private createEnvironment() {
        // [BACKGROUND] Clean Dark Gray
        this.add.rectangle(0, 0, this.scale.width * 2, this.scale.height * 2, 0x111111).setDepth(-10);

        // [GRID] Subtle floor grid for depth without clutter
        const grid = this.add.grid(0, 100, 2000, 1000, 50, 50, 0x000000, 0, 0x333333, 0.2);
        grid.setDepth(-5);
    }

    private createInteractionZone(x: number, y: number, w: number, h: number, color: number, label: string, focusType: any) {
        const container = this.add.container(x, y);

        // 1. The Block (Clean Shape - Wireframe Style)
        // Make it very subtle dark fill with colored border
        const shape = this.add.rectangle(0, 0, w, h, 0x000000, 0.5);
        shape.setStrokeStyle(2, color);

        // 2. The Text (Centered, Clear)
        const text = this.add.text(0, 0, label, {
            fontFamily: '"Orbitron", monospace',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // 3. Corner Accents (Decor)
        const cornerSize = 10;
        const tl = this.add.rectangle(-w / 2, -h / 2, cornerSize, cornerSize, color).setOrigin(0, 0);
        const br = this.add.rectangle(w / 2, h / 2, cornerSize, cornerSize, color).setOrigin(1, 1);

        container.add([shape, text, tl, br]);
        container.setSize(w, h);

        // Interaction
        container.setInteractive({ useHandCursor: true });

        // Hover Effect
        container.on('pointerover', () => {
            this.tweens.add({ targets: shape, fillAlpha: 0.8, duration: 100 }); // Light up background
            container.setScale(1.02);
        });
        container.on('pointerout', () => {
            this.tweens.add({ targets: shape, fillAlpha: 0.5, duration: 100 });
            container.setScale(1.0);
        });

        // Click Logic
        container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.focusOn(focusType);
            pointer.event.stopPropagation();
        });

        // Save reference based on type if needed (e.g. for focusOn)
        // Simplified for this generic creator
    }

    private createBlueprints() {
        // [BOTTOM] Blueprints - Character Switch
        // [AUTO-ADAPT] Place relative to bottom Safe Area
        const viewHeight = this.cameras.main.height;
        const bottomEdge = viewHeight / 2;
        const safeY = bottomEdge - 50 - Math.max(SafeArea.bottom, 20);

        this.blueprints = this.add.container(0, safeY);

        // Rolled papers
        const paper = this.add.rectangle(0, 0, 200, 40, 0xEEEEEE);
        paper.setStrokeStyle(1, 0x999999);

        // [REMOVED] Text Label
        // const text = ...

        this.blueprints.add([paper]);
        this.blueprints.setSize(200, 50);
        this.blueprints.setInteractive();

        this.blueprints.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.focusOn('BLUEPRINTS');
            pointer.event.stopPropagation();
        });
    }

    // --- Interaction Logic ---

    private focusOn(state: typeof this.currentFocus) {
        if (this.currentFocus === state) return;

        // 1. Play Sound (Optional)
        // this.sound.play('click_mechanical');

        // 2. State Update (No Camera Move)
        this.currentFocus = state;

        // 3. Emit UI Event (Opens Overlay)
        EventBus.emit('WORKBENCH_FOCUS', state);
    }

    private resetView() {
        if (this.currentFocus === 'NONE') return;

        // Just reset state
        this.currentFocus = 'NONE';
        EventBus.emit('WORKBENCH_FOCUS', 'NONE');
    }
}
