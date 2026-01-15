import Phaser from 'phaser';
import { addEntity, addComponent } from 'bitecs';
import { Transform, Velocity, Health, EnemyTag, Stats, CombatState, SpriteConfig, AttackCooldown, LootTag, Value, VisualEffect } from '../../ecs/components';

export class WaveManager {
    private scene: Phaser.Scene;
    private world: any;
    public wave: number = 1;
    private isGameActive: boolean = false;
    private spawnTimer: number = 0;

    // Wave Config
    private baseSpawnRate: number = 2000; // ms

    constructor(scene: Phaser.Scene, world: any) {
        this.scene = scene;
        this.world = world;
        this.reset();
    }

    public reset() {
        this.wave = 1;
        this.isGameActive = true;
        this.spawnTimer = 0;
    }

    public start(wave: number = 1) {
        this.wave = wave;
        this.isGameActive = true;
        this.spawnTimer = 0;
    }

    public onEnemyKilled(enemy: any) {
        // [FIX] Handle enemy death effects or count
        // For now, this is a hook for MainScene
    }

    public update(time: number, delta: number) {
        if (!this.isGameActive) return;

        // Spawn Logic
        this.spawnTimer += delta;

        // Difficulty Scaling
        const currentRate = Math.max(200, this.baseSpawnRate - (this.wave * 100));

        if (this.spawnTimer > currentRate) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }
    }

    private spawnEnemy() {
        // Random Position outside screen
        const cam = this.scene.cameras.main;
        const pad = 50;
        let x = 0, y = 0;

        // Simple edge spawn
        const bounds = this.scene.physics.world.bounds;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? -pad : bounds.width + pad;
            y = Math.random() * bounds.height;
        } else {
            x = Math.random() * bounds.width;
            y = Math.random() < 0.5 ? -pad : bounds.height + pad;
        }

        const eid = addEntity(this.world);

        addComponent(this.world, Transform, eid);
        addComponent(this.world, Velocity, eid);
        addComponent(this.world, Health, eid);
        addComponent(this.world, EnemyTag, eid);
        addComponent(this.world, Stats, eid);
        addComponent(this.world, CombatState, eid);
        addComponent(this.world, SpriteConfig, eid);
        addComponent(this.world, AttackCooldown, eid);
        addComponent(this.world, VisualEffect, eid); // [NEW]

        // Init Data (Grunt)
        Transform.x[eid] = x;
        Transform.y[eid] = y;

        Health.current[eid] = 20 + (this.wave * 5);
        Health.max[eid] = Health.current[eid];

        Stats.speed[eid] = 40 + (Math.random() * 20);
        Stats.damage[eid] = 10;
        Stats.attackRange[eid] = 0; // Melee Only

        AttackCooldown.cooldown[eid] = 500; // 0.5s Cooldown
        AttackCooldown.lastHitTime[eid] = 0;

        // Visuals
        SpriteConfig.textureId[eid] = 3; // Triangle
        SpriteConfig.scale[eid] = 1;
        SpriteConfig.tint[eid] = 0xFF0000;
    }

    public spawnLootAt(x: number, y: number, enemyTextureId: number) {
        // [FIX] Simple ECS Loot Spawn
        const lid = addEntity(this.world);

        addComponent(this.world, Transform, lid);
        addComponent(this.world, LootTag, lid);
        addComponent(this.world, Value, lid);
        addComponent(this.world, SpriteConfig, lid);

        Transform.x[lid] = x;
        Transform.y[lid] = y;

        Value.amount[lid] = 10 + (this.wave * 2);

        SpriteConfig.textureId[lid] = 2; // Square (Loot)
        SpriteConfig.scale[lid] = 0.5;
        SpriteConfig.tint[lid] = 0xFFD700; // Gold
    }
}
