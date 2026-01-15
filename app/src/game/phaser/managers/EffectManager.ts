import Phaser from 'phaser';
import { EventBus } from '../../../services/EventBus';
import { GAME_LAYER } from '../../constants/Depth';

export class EffectManager {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.setupListeners();
    }

    private setupListeners() {
        EventBus.on('SHOW_FLOATING_TEXT', (data: any) => this.showFloatingText(data));
        EventBus.on('DIRECTOR_STATE_CHANGE', (data: any) => this.showDirectorToast(data));
        EventBus.on('EXTRACTION_STATE_CHANGE', (state: string) => this.showExtractionAlert(state));
        EventBus.on('LOOT_PICKUP_VISUAL', (data: any) => this.showLootText(data));

        this.scene.events.on('shutdown', () => this.cleanup());
    }

    private cleanup() {
        EventBus.off('SHOW_FLOATING_TEXT');
        EventBus.off('DIRECTOR_STATE_CHANGE');
        EventBus.off('EXTRACTION_STATE_CHANGE');
        EventBus.off('LOOT_PICKUP_VISUAL');
    }

    private showFloatingText(data: { x: number, y: number, text: string, color: string }) {
        const isCrit = data.color === '#FFAA00';

        // [PROTO-MINIMALIST] Plain Sans-Serif Font
        const txt = this.scene.add.text(data.x, data.y, data.text, {
            fontSize: isCrit ? '24px' : '16px',
            color: data.color,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(GAME_LAYER.UI_TEXT);

        this.scene.tweens.add({
            targets: txt,
            y: data.y - 50,
            alpha: 0,
            duration: 800,
            onComplete: () => txt.destroy()
        });
    }

    private showDirectorToast(data: { msg: string }) {
        const txt = this.scene.add.text(this.scene.cameras.main.width / 2, 100, `[SYS] ${data.msg}`, {
            fontSize: '24px',
            color: '#FFFFFF',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
            fontFamily: 'monospace'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(GAME_LAYER.UI_TEXT);

        this.scene.tweens.add({
            targets: txt,
            alpha: 0,
            duration: 3000,
            onComplete: () => txt.destroy()
        });
    }

    private showExtractionAlert(state: string) {
        // [MINIMALIST] Simplified text alerts
    }

    private showLootText(data: { x: number, y: number, text: string, color: string }) {
        const txt = this.scene.add.text(data.x, data.y, data.text, {
            fontSize: '14px', color: data.color, fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(GAME_LAYER.UI_TEXT);

        this.scene.tweens.add({
            targets: txt, y: data.y - 40, alpha: 0, duration: 600, onComplete: () => txt.destroy()
        });
    }

    public triggerConfetti() {
        // [REMOVED] Confetti disabled for minimalist style
    }

    public showPanicOverlay() {
        // [MINIMALIST] Simple Red Border Warning
        const overlay = this.scene.add.rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0xFF0000, 0);
        overlay.setStrokeStyle(4, 0xFF0000);
        overlay.setScrollFactor(0).setDepth(GAME_LAYER.OVERLAY_PANIC);

        this.scene.tweens.add({
            targets: overlay,
            alpha: { from: 1, to: 0 },
            duration: 500,
            yoyo: true,
            repeat: 4,
            onComplete: () => overlay.destroy()
        });
    }
}
