import Phaser from 'phaser';
import { EventBus } from '../../../services/EventBus';
import { ItemInstance } from '../../../types';
import { ItemLibrary } from '../../data/library/items';

import { addEntity, addComponent } from 'bitecs';
import { Transform, Velocity, ProjectileTag, SpriteConfig, Damage, Lifetime } from '../../ecs/components';

export class WeaponSystem {
    private scene: Phaser.Scene;
    public projectiles: Phaser.GameObjects.Group;
    private world: any;

    constructor(scene: Phaser.Scene, world: any) {
        this.scene = scene;
        this.projectiles = scene.add.group();
        this.world = world;
    }

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

        // [DEBUG] Trace Weapon Fire
        if (source.id === 'player') {
            console.log(`[WeaponSystem] Firing: ${def.id} | Behavior: ${def.behavior} | Def Loaded: ${!!def}`);
        }

        // 1. Pipeline: Calculate Final Stats (Inlined after WeaponRegistry deletion)
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
            projectileCount: 1,
            spreadMod: source.isSiege ? 0.5 : 1.0,
            duration: (rng / spd) * 1000
        };

        // 2. Juice: Trigger generic effects
        this.playFireJuice(source, def.behavior);

        // 3. Strategy: Execute Behavior (ADAPTER: ECS Mode)
        // Instead of calling strategy.execute (OOP), we spawn ECS entities directly here.
        // This effectively bypasses the detailed Strategy pattern for now in favor of raw ECS data.

        const count = stats.projectileCount || 1;
        const spread = 0.2 * (stats.spreadMod || 1);
        const speed = stats.speed || 600;
        const damage = stats.damage || 10;
        const duration = stats.duration || 1000;

        // [WEAPON DIFFERENTIATION] Apply behavior-specific settings
        let textureId = 1; // Default: circle
        let tint = 0xF59E0B; // Default: amber
        let scale = 0.4;
        let projSpeed = speed;
        let projDamage = damage;
        let projDuration = duration;

        // [V2] Behavior to Animation Mapping (Data-Driven)
        const BEHAVIOR_TO_ANIMATION: Record<string, string> = {
            'MELEE_SWEEP': 'SWING',
            'MELEE_THRUST': 'THRUST',
            'PISTOL_SHOT': 'SHOOT',
            'RIFLE_BURST': 'SHOOT',
            'BOW_SHOT': 'DRAWBOW',
            'GRENADE_THROW': 'THROW',
            'DRONE_BEAM': 'NONE',
            'HOMING_ORB': 'NONE',
            'SHOCKWAVE': 'NONE',
            'LASER': 'SHOOT',
            'BOOMERANG': 'THROW'
        };

        // Determine animation type (definition priority, fallback to mapping)
        const animType = def.animationType || BEHAVIOR_TO_ANIMATION[def.behavior || ''] || 'NONE';

        // [V2] Emit weapon animation event for Player (before switch for all behaviors)
        if (!source.isEnemy && animType !== 'NONE') {
            EventBus.emit('PLAYER_WEAPON_ANIM', { type: animType, weaponId: def.id });
            EventBus.emit('PLAY_SFX', animType === 'SWING' ? 'SWING' : 'SHOOT');
        }

        // [SAFETY] Prevent Default Bullet Firing if Behavior is improper
        let valid = false;

        switch (def.behavior) {
            case 'MELEE_SWEEP':
            case 'MELEE_THRUST':
                // [MELEE V3] Universal Hitbox Logic
                valid = true;

                // 1. Calculate Universal Offset
                // Default: 40px forward (if no config)
                // New Config: def.hitbox.offset
                const offsetDist = def.hitbox?.offset || 40;
                const hitWidth = def.hitbox?.width || 60; // Radius or Width

                // 2. Math: Project from Center using Rotation
                // Rotation is in Radians in Phaser
                const angle = source.rotation;
                const originX = source.x + Math.cos(angle) * offsetDist;
                const originY = source.y + Math.sin(angle) * offsetDist;

                // 3. Set Properties
                // Currently only supporting CIRCLE approximation for creating entities
                // Future: Use Shape Component for collisions
                textureId = 0; // Invisible
                tint = 0xFF00FF; // Debug Pink (if rendered)
                scale = hitWidth / 16; // 16px base size -> scaled to radius
                projSpeed = 0; // Static relative to spawn (doesn't move)
                projDuration = def.hitbox?.duration || 100;
                projDamage = damage * 1.5;

                // [DEBUG VISUAL] Force Render Pink Orb to verify offset
                // This relies on RenderSystem debug override for textureId 0

                // Override spawn position logic below (hacky but effective for this system)
                // We need to inject originX/originY into the spawn loop
                // Actually, the generic spawn below uses `source.x`. We need to override it.
                // Let's create the entity HERE and skip the default spawn at bottom??
                // No, better to set a flag or just modify `spawnX/Y` variables if we had them.
                // Refactoring spawn logic to separate variables:
                break;

            case 'DRONE_BEAM':
                textureId = 1; // Circle
                tint = 0x3B82F6; // Blue
                scale = 0.25;
                projSpeed = 800;
                projDamage = damage * 0.3;
                projDuration = 600;
                valid = true;
                break;
            case 'PISTOL_SHOT':
                // Use defaults above
                valid = true;
                break;
            default:
                console.warn(`[WeaponSystem] Unknown Behavior: ${def.behavior}. Defaulting to NO-OP to prevent Ghost Bullets.`);
                valid = false; // [FIX] Disable default bullets
                break;
        }

        if (!valid) return;

        for (let i = 0; i < count; i++) {
            let angle = source.rotation;
            if (count > 1) {
                angle += (i - (count - 1) / 2) * spread;
            }

            // Spawn ECS Projectile
            const eid = addEntity(this.world);

            addComponent(this.world, Transform, eid);
            addComponent(this.world, Velocity, eid);
            addComponent(this.world, SpriteConfig, eid);
            addComponent(this.world, ProjectileTag, eid);
            addComponent(this.world, Damage, eid);
            addComponent(this.world, Lifetime, eid);

            // Offset for Melee V3 (Generic)
            let spawnX = source.x;
            let spawnY = source.y;

            if (projSpeed === 0 && def.hitbox) {
                // Use Pre-calculated V3 Logic
                const offsetDist = def.hitbox.offset;
                const hitAngle = angle; // Use projective angle
                spawnX += Math.cos(hitAngle) * offsetDist;
                spawnY += Math.sin(hitAngle) * offsetDist;
            } else if (projSpeed === 0 && def.behavior === 'MELEE_SWEEP') {
                // Legacy Fallback (should be removed once all migrated)
                const offset = 40;
                spawnX += Math.cos(angle) * offset;
                spawnY += Math.sin(angle) * offset;
            }

            Transform.x[eid] = spawnX;
            Transform.y[eid] = spawnY;
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

        // Just for reference, we skip the old strategy block
        /*
        const strategy = STRATEGIES[def.behavior];
        if (strategy) { ... } 
        */
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
