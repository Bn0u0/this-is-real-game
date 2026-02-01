import Phaser from 'phaser';
import { ItemDef, ItemInstance } from '../../../types';

/**
 * Manages orbiting weapon sprites around the player.
 * Brotato-style: Weapons orbit independently and have attached hitboxes.
 * 
 * V4 Architecture:
 * - This is a VISUAL manager, not an ECS system.
 * - It syncs Phaser Sprites with ECS WeaponEntity data.
 * - Collision is handled by ECS WeaponCollisionSystem.
 */

interface OrbitingWeapon {
    id: string;
    sprite: Phaser.GameObjects.Sprite;
    def: ItemDef;

    // Orbit State
    radius: number;
    speed: number;
    angleOffset: number;
    currentAngle: number;

    // Attack State
    isAttacking: boolean;
    cooldownRemaining: number;
    attackProgress: number;
    attackDuration: number;
    attackInstanceId: number; // Unique ID for each attack cycle
}

export class WeaponOrbitManager {
    private scene: Phaser.Scene;
    private weapons: Map<string, OrbitingWeapon> = new Map();
    private playerRef: { x: number; y: number } | null = null;

    // Configuration
    private defaultRadius: number = 60;
    private defaultSpeed: number = 3.0; // rad/s

    // Attack instance tracking (for hit prevention)
    private attackInstanceCounter: number = 0;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * Binds the manager to a player reference for position tracking.
     */
    public bindToPlayer(player: { x: number; y: number }) {
        this.playerRef = player;
    }

    /**
     * Adds a weapon to the orbit system.
     */
    public addWeapon(weapon: ItemInstance): string {
        const def = weapon.def;
        if (!def) {
            console.warn('[WeaponOrbitManager] Cannot add weapon: Missing definition');
            return '';
        }

        const id = weapon.uid;

        // Use def config or defaults
        const radius = def.orbitConfig?.radius ?? this.defaultRadius;
        const speed = def.orbitConfig?.speed ?? this.defaultSpeed;

        // Calculate angle offset to distribute weapons evenly
        const weaponCount = this.weapons.size + 1;
        const angleOffset = (2 * Math.PI / weaponCount) * this.weapons.size;

        // Create Sprite
        const textureKey = def.icon || 'tex_orb';
        const sprite = this.scene.add.sprite(0, 0, textureKey);
        sprite.setOrigin(0.5, 0.5);
        sprite.setDepth(10); // Above player

        // Attack config
        const attackDuration = def.attackConfig?.duration ?? 200;
        const attackSpeed = def.baseStats?.fireRate ?? 500;

        const orbitingWeapon: OrbitingWeapon = {
            id,
            sprite,
            def,
            radius,
            speed,
            angleOffset,
            currentAngle: angleOffset,
            isAttacking: false,
            cooldownRemaining: 0,
            attackProgress: 0,
            attackDuration,
            attackInstanceId: 0 // Will be set when attack starts
        };

        this.weapons.set(id, orbitingWeapon);
        this.redistributeAngles(); // Rebalance all weapons

        console.log(`[WeaponOrbitManager] Added weapon: ${def.name} (${id})`);
        return id;
    }

    /**
     * Removes a weapon from the orbit system.
     */
    public removeWeapon(id: string) {
        const weapon = this.weapons.get(id);
        if (weapon) {
            weapon.sprite.destroy();
            this.weapons.delete(id);
            this.redistributeAngles();
        }
    }

    /**
     * Clears all weapons.
     */
    public clear() {
        for (const w of this.weapons.values()) {
            w.sprite.destroy();
        }
        this.weapons.clear();
    }

    /**
     * Redistributes angle offsets so weapons are evenly spaced.
     */
    private redistributeAngles() {
        const count = this.weapons.size;
        if (count === 0) return;

        let i = 0;
        for (const w of this.weapons.values()) {
            w.angleOffset = (2 * Math.PI / count) * i;
            i++;
        }
    }

    /**
     * Main update loop. Call every frame from Player.update().
     */
    public update(time: number, delta: number) {
        if (!this.playerRef) return;

        const dt = delta / 1000; // Convert to seconds
        const px = this.playerRef.x;
        const py = this.playerRef.y;

        for (const w of this.weapons.values()) {
            // 1. Update Orbit Angle
            w.currentAngle += w.speed * dt;
            if (w.currentAngle > Math.PI * 2) {
                w.currentAngle -= Math.PI * 2;
            }

            // 2. Calculate World Position
            const angle = w.currentAngle + w.angleOffset;
            const x = px + Math.cos(angle) * w.radius;
            const y = py + Math.sin(angle) * w.radius;

            w.sprite.setPosition(x, y);

            // 3. Weapon rotation (point outward)
            w.sprite.rotation = angle + Math.PI / 2;

            // 4. Attack Cooldown / State Management
            this.updateAttackState(w, dt);

            // 5. Visual Feedback during attack
            if (w.isAttacking) {
                // Scale pulse or glow effect
                const pulse = 1.0 + Math.sin(w.attackProgress * Math.PI) * 0.3;
                w.sprite.setScale(pulse);
            } else {
                w.sprite.setScale(1.0);
            }
        }
    }

    /**
     * Updates the attack state for a weapon.
     */
    private updateAttackState(w: OrbitingWeapon, dt: number) {
        const attackSpeed = w.def.baseStats?.fireRate ?? 500; // ms

        if (w.isAttacking) {
            // Progress attack
            w.attackProgress += (dt * 1000) / w.attackDuration;
            if (w.attackProgress >= 1.0) {
                w.isAttacking = false;
                w.attackProgress = 0;
                w.cooldownRemaining = attackSpeed;
            }
        } else {
            // Cooldown
            w.cooldownRemaining -= dt * 1000;
            if (w.cooldownRemaining <= 0) {
                w.isAttacking = true;
                w.attackProgress = 0;
                // Generate new attack instance ID
                w.attackInstanceId = ++this.attackInstanceCounter;
            }
        }
    }

    /**
     * Gets all weapons currently attacking (for collision system).
     */
    public getAttackingWeapons(): { id: string; x: number; y: number; def: ItemDef; progress: number; attackInstanceId: number }[] {
        const result: { id: string; x: number; y: number; def: ItemDef; progress: number; attackInstanceId: number }[] = [];

        for (const w of this.weapons.values()) {
            if (w.isAttacking) {
                result.push({
                    id: w.id,
                    x: w.sprite.x,
                    y: w.sprite.y,
                    def: w.def,
                    progress: w.attackProgress,
                    attackInstanceId: w.attackInstanceId
                });
            }
        }

        return result;
    }

    /**
     * Get all weapon sprites (for debug rendering).
     */
    public getWeaponSprites(): Phaser.GameObjects.Sprite[] {
        return Array.from(this.weapons.values()).map(w => w.sprite);
    }

    /**
     * Returns the number of equipped weapons.
     */
    public getWeaponCount(): number {
        return this.weapons.size;
    }
}
