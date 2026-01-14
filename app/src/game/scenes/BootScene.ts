import Phaser from 'phaser';
import { EventBus } from '../../services/EventBus';
import { COLORS } from '../../constants';

export class BootScene extends Phaser.Scene {
    private terminalText!: Phaser.GameObjects.Text;
    private scanline!: Phaser.GameObjects.Rectangle;
    private progressFill!: Phaser.GameObjects.Rectangle; // [NEW]
    private bootLines: string[] = [
        "SYNAPSE OS v4.0.1 (c) 2142",
        "INITIALIZING CORE SYSTEMS...",
        "[OK] MEMORY INTEGRITY CHECK",
        "[OK] NEURAL LINK ESTABLISHED",
        "[OK] WEAPON SYSTEMS ONLINE",
        "[WARN] UNREGISTERED USER DETECTED",
        "LOADING PROFILE...",
        "...",
        "READY."
    ];
    private lineIndex: number = 0;
    private charIndex: number = 0;

    constructor() {
        super('BootScene');
    }

    preload() {
        // [CLEANUP] Assets removed.
        // this.load.image('bg_hideout_papercut', 'assets/bg/bg_hideout_papercut.png');

        // [PROTO-MINIMALIST] Generate Geometric Textures
        const graphics = this.make.graphics({ x: 0, y: 0 }, false);

        // 1. Circle (Boss/Projectile)
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('circle', 32, 32);

        // 2. Square (Elite/Wall)
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('square', 32, 32);

        // 3. Triangle (Basic Enemy)
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        graphics.beginPath();
        graphics.moveTo(16, 0);
        graphics.lineTo(32, 32);
        graphics.lineTo(0, 32);
        graphics.closePath();
        graphics.fillPath();
        graphics.generateTexture('triangle', 32, 32);

        // [LEGACY COMPAT] tex_orb -> circle
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('tex_orb', 16, 16);
    }

    create() {
        // [SILENT BOOT]
        // The React 'BootScreen' handles the visuals.
        // This scene just needs to hand off to Workbench.

        console.log("🚀 [BootScene] Handing off to WorkbenchScene...");
        this.scene.start('WorkbenchScene');
    }

    // [REMOVED] All visual helper methods (typeNextChar, etc.)
}
