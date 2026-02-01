import Phaser from 'phaser';
import { ItemDef } from '../../../types';
import { PlayerSprite } from './PlayerSprite';

/**
 * The Visual Rig for the Player.
 * V3 Refactor: Wraps the "Baba Style" PlayerSprite (Art Lab) into the Game's Container API.
 * This ensures the main game uses the exact same visuals as the Art Lab.
 */
export class PlayerRig extends Phaser.GameObjects.Container {
    private char: PlayerSprite;
    private weapon: Phaser.GameObjects.Sprite;

    // Animation State
    private isAttacking: boolean = false;
    private attackTimer: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        // 1. Character (The Wobbly Potato)
        // Note: PlayerSprite handles its own frame animation and bobbing in preUpdate.
        this.char = new PlayerSprite(scene, 0, 0);
        this.add(this.char);

        // 2. Weapon (The Icon)
        this.weapon = scene.add.sprite(60, 15, 'weapon_crowbar'); // Default pos
        this.weapon.setOrigin(0.2, 0.5); // Hold handle
        this.add(this.weapon);
    }

    public updateAnim(time: number, speed: number, isMoving: boolean) {
        // Delegate movement state to the Character Sprite
        // Speed multiplier controls the "Wobble Speed"
        this.char.setIsMoving(isMoving);

        // Adjust wobble speed based on movement
        // If moving fast, wobble faster?
        // PlayerSprite default is frameSpeed = 150.
        // We can tweak it.
        const wobbleFactor = isMoving ? 2.0 : 1.0;
        this.char.setWobbleSpeed(wobbleFactor);

        // Sync Weapon to Character's Vertical Bobbing
        // PlayerSprite.y changes during preUpdate (Auto-hop).
        // Since PlayerSprite is a child of THIS container, its local Y changes.
        // We want the weapon to follow that Y change relative to the container?
        // Actually, PlayerSprite.y modifies itself.
        // If we want the weapon to bob WITH the character, we should latch it.

        // PlayerSprite.y is the bob offset.
        // Weapon should be BaseY (15) + CharY.

        // However, we can't easily read char.y inside a plain update unless we poll it.
        // Better approach: Calculate the weapon position here based on the same logic 
        // OR just look at char.y
        this.weapon.y = 15 + this.char.y;

        // Handle Attack Animation
        if (this.isAttacking) {
            // Simple recoil/swing logic ported from Art Lab WeaponMode
            const attackSpeed = 0.2; // Speed up compared to Lab
            this.attackTimer += attackSpeed;

            const cycle = this.attackTimer;
            const recoil = Math.sin(cycle) * 15;
            const rotationOffset = Math.sin(cycle * 0.5) * 0.4; // Rads

            this.weapon.x = 60 + recoil;
            // Base rotation is 0 (right facing).
            this.weapon.rotation = rotationOffset;

            if (this.attackTimer > Math.PI * 2) {
                this.isAttacking = false;
                this.weapon.rotation = 0;
                this.weapon.x = 60;
            }
        }
    }

    /**
     * Equips a weapon visually.
     */
    public equipWeapon(def: ItemDef) {
        if (!def) return;

        // Use the generated icon if available, otherwise fallback
        const textureKey = def.icon || 'tex_orb';
        this.weapon.setTexture(textureKey);
        this.weapon.setVisible(true);

        // Handle Special Offsets (e.g. Drones float, Fists center)
        // Logic ported from WeaponMode.ts
        if (textureKey === 'weapon_drone' || textureKey.includes('drone')) {
            this.weapon.setPosition(-40, -60);
            this.weapon.setOrigin(0.5, 0.5);
        } else if (textureKey === 'weapon_fist_t0' || textureKey.includes('fist')) {
            this.weapon.setPosition(0, 0);
            this.weapon.setOrigin(0.5, 0.5);
            this.weapon.setVisible(false); // Hide weapon sprite if it's just a fist? 
            // Actually Art Lab shows it. Let's keep it visible but centered on body.
            // But PlayerSprite already has a floating hand.
            // Maybe for Fist we hide the weapon sprite and show the hand?
            // PlayerSprite hand is always there?
            // Let's just center it for now.
        } else {
            // Standard Gun/Melee
            this.weapon.setPosition(60, 15);
            this.weapon.setOrigin(0.2, 0.5);
        }

        // Ensure Char Hand is visible? 
        // PlayerSprite has its own hand.
        this.char.setHandVisible(true);
    }

    public playSwing() {
        this.isAttacking = true;
        this.attackTimer = 0;
    }

    // Compatibility stubs for Player.ts
    public playShootAnimation(angle?: number) {
        this.playSwing(); // Reuse for now
    }

    public playThrowAnimation() {
        this.playSwing();
    }

    public playDrawbowAnimation() {
        this.playSwing(); // Reuse
    }
}
