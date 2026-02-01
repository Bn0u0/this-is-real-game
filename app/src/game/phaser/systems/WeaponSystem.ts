import Phaser from 'phaser';
import { EventBus } from '../../../services/EventBus';
import { ItemInstance } from '../../../types';
import { ItemLibrary } from '../../data/library/items';

import { addEntity, addComponent } from 'bitecs';
import { Transform, Velocity, ProjectileTag, SpriteConfig, Damage, Lifetime } from '../../ecs/components';

/**
 * ProjectileSystem (Renamed from WeaponSystem)
 * 
 * V4 Refactor: This system now ONLY handles projectile spawning.
 * Melee attacks are handled by WeaponOrbitManager + WeaponCollisionSystem.
 * 
 * Responsibilities:
 * - Spawn ECS projectile entities for ranged weapons
 * - Apply projectile visual effects (muzzle flash, recoil)
 * - NOT responsible for melee hitboxes anymore
 */
export class ProjectileSystem {
    private scene: Phaser.Scene;
    public projectiles: Phaser.GameObjects.Group;
    private world: any;

    constructor(scene: Phaser.Scene, world: any) {
        this.scene = scene;
        this.projectiles = scene.add.group();
        this.world = world;
    }

    /**
     * Fires a projectile for ranged weapons.
     * Melee weapons should NOT call this method.
     */
    public fire(weapon: ItemInstance, source: { x: number, y: number, rotation: number, id: string, isSiege?: boolean, isEnemy?: boolean }, playerStats: any, target?: { x: number, y: number }) {
        let def = ItemLibrary.get(weapon.defId);

        // [FALLBACK] Support ad-hoc weapons (e.g., Sentry Turret)
        if (!def && weapon.defId === 'turret_gun') {
            def = {
                id: 'turret_gun',
                name: 'Turret Gun',
                type: 'WEAPON',
                slot: 'mainWeapon',
                tier: 0,
                rarity: 'COMMON',
                baseStats: {
                    damage: 5,
                    range: 250,
                    fireRate: 800,
                    speed: 600,
                    critChance: 0,
                    defense: 0,
                    hpMax: 0
                },
                description: 'Auto Sentry',
                icon: 'tex_orb',
                behavior: 'PISTOL_SHOT'
            };
        }

        if (!def || !def.behavior) return;

        // [V4] Skip melee weapons - handled by WeaponOrbitManager
        if (def.behavior === 'MELEE_SWEEP' || def.behavior === 'MELEE_THRUST') {
            return; // No-op for melee
        }

        // [DEBUG] Trace Weapon Fire
        if (source.id === 'player') {
            console.log(`[ProjectileSystem] Firing: ${def.id} | Behavior: ${def.behavior}`);
        }

        // 1. Calculate Final Stats
        let dmg = weapon.computedStats?.damage || 1;
        let rng = weapon.computedStats?.range || 500;
        let spd = weapon.computedStats?.speed || 600;

        if (source.isSiege) {
            dmg *= 1.25;
            rng *= 1.5;
        }

        const stats = {
            damage: dmg,
            range: rng,
            fireRate: weapon.computedStats?.fireRate,
            speed: spd,
            projectileCount: def.projectileConfig?.count || 1,
            spreadMod: source.isSiege ? 0.5 : 1.0,
            duration: (rng / spd) * 1000
        };

        // 2. Juice: Trigger effects
        this.playFireJuice(source, def.behavior);

        // 3. Determine projectile properties based on behavior
        const count = stats.projectileCount || 1;
        const spread = (def.projectileConfig?.spread || 0.2) * (stats.spreadMod || 1);
        const speed = def.projectileConfig?.speed || stats.speed || 600;
        const damage = stats.damage || 10;
        const duration = def.projectileConfig?.lifetime || stats.duration || 1000;

        let textureId = 1; // Default: circle
        let tint = 0xF59E0B; // Default: amber
        let scale = 0.4;
        let projSpeed = speed;
        let projDamage = damage;
        let projDuration = duration;

        // Behavior-specific overrides
        switch (def.behavior) {
            case 'DRONE_BEAM':
                textureId = 1;
                tint = 0x3B82F6; // Blue
                scale = 0.25;
                projSpeed = 800;
                projDamage = damage * 0.3;
                projDuration = 600;
                break;
            case 'PISTOL_SHOT':
                // Defaults
                break;
            case 'RIFLE_BURST':
                tint = 0xEF4444; // Red
                scale = 0.3;
                projSpeed = 900;
                break;
            case 'BOW_SHOT':
                textureId = 2; // Arrow texture
                tint = 0x8B5CF6; // Purple
                scale = 0.5;
                projSpeed = 700;
                break;
            case 'LASER':
                textureId = 1;
                tint = 0x00FF00; // Green
                scale = 0.2;
                projSpeed = 1200;
                projDuration = 300;
                break;
            case 'HOMING_ORB':
                tint = 0xFF00FF; // Magenta
                scale = 0.6;
                projSpeed = 400;
                projDuration = 2000;
                // TODO: Add homing logic in MovementSystem
                break;
            default:
                // Unknown ranged behavior - use defaults
                break;
        }

        // 4. Spawn projectiles
        for (let i = 0; i < count; i++) {
            let angle = source.rotation;
            if (count > 1) {
                angle += (i - (count - 1) / 2) * spread;
            }

            const eid = addEntity(this.world);

            addComponent(this.world, Transform, eid);
            addComponent(this.world, Velocity, eid);
            addComponent(this.world, SpriteConfig, eid);
            addComponent(this.world, ProjectileTag, eid);
            addComponent(this.world, Damage, eid);
            addComponent(this.world, Lifetime, eid);

            Transform.x[eid] = source.x;
            Transform.y[eid] = source.y;
            Transform.rotation[eid] = angle;

            Velocity.x[eid] = Math.cos(angle) * projSpeed;
            Velocity.y[eid] = Math.sin(angle) * projSpeed;

            SpriteConfig.textureId[eid] = textureId;
            SpriteConfig.scale[eid] = scale;
            SpriteConfig.tint[eid] = tint;

            Damage.value[eid] = projDamage;
            Damage.ownerId[eid] = source.isEnemy ? 0 : 1; // 1 = Player

            Lifetime.remaining[eid] = projDuration;
            Lifetime.total[eid] = projDuration;
        }
    }

    private playFireJuice(source: any, behavior: string) {
        EventBus.emit('PLAY_SFX', 'SHOOT');

        // Muzzle Flash
        const flash = this.scene.add.circle(
            source.x + Math.cos(source.rotation) * 40,
            source.y + Math.sin(source.rotation) * 40,
            12,
            0xFFFF00
        );
        flash.setBlendMode(Phaser.BlendModes.ADD);
        this.scene.tweens.add({
            targets: flash,
            scale: 0,
            alpha: 0,
            duration: 50,
            onComplete: () => flash.destroy()
        });

        // Recoil
        if (source.id === 'player') {
            EventBus.emit('PLAYER_RECOIL', { force: 200, angle: source.rotation });
        }
    }
}

// [COMPAT] Export alias for backward compatibility
export { ProjectileSystem as WeaponSystem };
