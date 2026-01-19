import Phaser from 'phaser';
import { ArtLabState } from '../ArtLabConfig';
import { ItemLibrary } from '../../game/data/library/items';

export class WeaponMode {
    private scene: Phaser.Scene;
    private weaponSprite: Phaser.GameObjects.Sprite | null = null;
    private config: ArtLabState | null = null;

    // Animation state
    private attackTimer: number = 0;
    private isAttacking: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public create() {
        // Initial setup
        this.weaponSprite = this.scene.add.sprite(0, 0, 'weapon_nailgun');
        this.weaponSprite.setVisible(false);
        this.weaponSprite.setOrigin(0.5, 0.5);
        this.weaponSprite.setDepth(30); // Keep on top
    }

    public updateConfig(config: ArtLabState) {
        this.config = config;
        const isWeaponMode = config.activeMode === 'WEAPON';

        if (!this.weaponSprite || !this.weaponSprite.scene) return;

        this.weaponSprite.setVisible(isWeaponMode);

        if (isWeaponMode) {
            // Update Texture if changed
            const item = ItemLibrary.get(config.selectedWeaponId);
            if (item && item.icon) {
                this.weaponSprite.setTexture(item.icon);
            } else {
                this.weaponSprite.setTexture('tex_orb');
            }

            // Match Body Position (Outside the character's body)
            this.weaponSprite.x = 60;
            this.weaponSprite.y = 15;

            // Handle Specifics (Drone floats)
            if (config.selectedWeaponId === 'weapon_drone_t0') {
                this.weaponSprite.y = -60; // Float above
                this.weaponSprite.x = -40; // Behind
                this.weaponSprite.setOrigin(0.5, 0.5);
            } else if (config.selectedWeaponId === 'w_fist_t0') {
                this.weaponSprite.setOrigin(0.5, 0.5); // Fist is just a blob
            } else {
                this.weaponSprite.setOrigin(0.2, 0.5); // Hold at handle/base
            }

            // Apply Transforms
            this.weaponSprite.setScale(config.weaponScale);

            // If not attacking, use manual rotation
            if (!this.isAttacking) {
                this.weaponSprite.setRotation(Phaser.Math.DegToRad(config.weaponRotation));
            }

            // Handle Attack Simulation State Change
            if (config.simulatingAttack && !this.isAttacking) {
                this.startAttack();
            } else if (!config.simulatingAttack) {
                this.isAttacking = false;
            }
        }
    }

    private startAttack() {
        this.isAttacking = true;
        this.attackTimer = 0;
    }

    public update(time: number, delta: number) {
        if (!this.weaponSprite || !this.weaponSprite.scene || !this.weaponSprite.visible || !this.config) return;

        // Base Hand Position
        const handX = 60;
        const handY = 15;

        if (this.isAttacking) {
            this.attackTimer += delta;

            // Simple procedural swing/poke animation based on time
            const speed = 0.012;
            const cycle = this.attackTimer * speed;

            // Recoil/Swing logic
            const recoil = Math.sin(cycle) * 15;
            const rotationOffset = Math.sin(cycle * 0.5) * 0.4;

            this.weaponSprite.x = handX + recoil; // Shake relative to hand position
            this.weaponSprite.setRotation(Phaser.Math.DegToRad(this.config.weaponRotation) + rotationOffset);
        } else {
            // Reset to neutral (Keep hand offset!)
            this.weaponSprite.x = handX;
            this.weaponSprite.y = handY;

            // Drone/Fist specific offsets are handled in updateConfig, 
            // but we ensure drones float even during update if needed.
            if (this.config.selectedWeaponId === 'weapon_drone_t0') {
                this.weaponSprite.y = -60;
                this.weaponSprite.x = -40;
            }
        }
    }
}
