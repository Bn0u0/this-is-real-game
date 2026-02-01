import Phaser from 'phaser';
import { PlayerSprite } from './PlayerSprite';

/**
 * The Visual Rig for the Player.
 * V4 Refactor: Character-only visual container.
 * 
 * CHANGE LOG:
 * - Weapons are now managed by WeaponOrbitManager (Brotato Style).
 * - This class only handles the character sprite (Baba Style Potato).
 */
export class PlayerRig extends Phaser.GameObjects.Container {
    private char: PlayerSprite;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        // 1. Character (The Wobbly Potato)
        // Note: PlayerSprite handles its own frame animation and bobbing in preUpdate.
        this.char = new PlayerSprite(scene, 0, 0);
        this.add(this.char);

        // [FIX] Scale down to fit 64x64 grid (Assets are 128x128)
        this.setScale(0.5);
    }

    public updateAnim(time: number, speed: number, isMoving: boolean) {
        // Delegate movement state to the Character Sprite
        this.char.setIsMoving(isMoving);

        // Adjust wobble speed based on movement
        const wobbleFactor = isMoving ? 2.0 : 1.0;
        this.char.setWobbleSpeed(wobbleFactor);
    }

    // [DEPRECATED] Weapon methods removed - now handled by WeaponOrbitManager
    // Stubs kept for temporary backward compatibility
    public equipWeapon(def: any) {
        console.warn('[PlayerRig] equipWeapon() is deprecated. Use WeaponOrbitManager.addWeapon() instead.');
    }

    public playSwing() {
        // No-op. Attack visuals now handled by WeaponOrbitManager.
    }

    public playShootAnimation(angle?: number) {
        // No-op.
    }

    public playThrowAnimation() {
        // No-op.
    }

    public playDrawbowAnimation() {
        // No-op.
    }
}
