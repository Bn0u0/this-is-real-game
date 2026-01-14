import Phaser from 'phaser';
import { EventBus } from '../../services/EventBus';
import { ItemInstance } from '../../types';
import { ItemLibrary } from '../data/library/items';
import { STRATEGIES, WeaponPipeline } from './weapons/WeaponRegistry';

import { addEntity, addComponent } from 'bitecs';
import { Transform, Velocity, ProjectileTag, SpriteConfig, Damage, Lifetime } from '../ecs/Components';

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

        // 1. Pipeline: Calculate Final Stats
        const stats = WeaponPipeline.resolveStats(weapon, playerStats, source);

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

            Transform.x[eid] = source.x;
            Transform.y[eid] = source.y;
            Transform.rotation[eid] = angle;

            Velocity.x[eid] = Math.cos(angle) * speed;
            Velocity.y[eid] = Math.sin(angle) * speed;

            SpriteConfig.textureId[eid] = 1; // 'circle' for bullets
            SpriteConfig.scale[eid] = 0.4;
            SpriteConfig.tint[eid] = 0xF59E0B; // Amber (Player Color)

            Damage.value[eid] = damage;
            Damage.ownerId[eid] = source.isEnemy ? 0 : 1; // 1 = Player

            Lifetime.remaining[eid] = duration;
            Lifetime.total[eid] = duration;
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
