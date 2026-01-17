import Phaser from 'phaser';
import { addEntity, addComponent } from 'bitecs';
import { Transform, Velocity, Health, EnemyTag, Stats, CombatState, SpriteConfig, AttackCooldown, LootTag, Value, VisualEffect } from '../../ecs/components';
import { TerrainManager } from './TerrainManager';

export class WaveManager {
    private scene: Phaser.Scene;
    private world: any;
    public wave: number = 1;
    private isGameActive: boolean = false;
    private spawnTimer: number = 0;

    // Wave Config
    private baseSpawnRate: number = 2000; // ms

    private terrainManager: TerrainManager; // [NEW]

    constructor(scene: Phaser.Scene, world: any, terrainManager: TerrainManager) {
        this.scene = scene;
        this.world = world;
        this.terrainManager = terrainManager;
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
        // Random Position around Camera Viewport
        const cam = this.scene.cameras.main;
        const pad = 100; // Spawn just outside view
        let x = 0, y = 0;
        let attempts = 0;
        const maxAttempts = 10;
        let validSpawn = false;

        // Use worldView to get current camera bounds
        const view = cam.worldView;

        while (attempts < maxAttempts && !validSpawn) {
            attempts++;

            // 0: Top, 1: Bottom, 2: Left, 3: Right
            const side = Math.floor(Math.random() * 4);

            switch (side) {
                case 0: // Top
                    x = view.x + Math.random() * view.width;
                    y = view.y - pad;
                    break;
                case 1: // Bottom
                    x = view.x + Math.random() * view.width;
                    y = view.y + view.height + pad;
                    break;
                case 2: // Left
                    x = view.x - pad;
                    y = view.y + Math.random() * view.height;
                    break;
                case 3: // Right
                    x = view.x + view.width + pad;
                    y = view.y + Math.random() * view.height;
                    break;
            }

            // Check if valid ground
            if (this.terrainManager.isGround(x, y)) {
                validSpawn = true;
            }
        }

        if (!validSpawn) {
            console.log(`[WaveManager] Failed to find valid spawn after ${maxAttempts} attempts.`);
            return;
        }

        console.log(`[WaveManager] Spawning Enemy at (${x.toFixed(0)}, ${y.toFixed(0)}) | Wave: ${this.wave}`);

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

        // Visuals (Random: 3=Triangle, 4=Square, 5=Pentagon)
        const types = [3, 4, 5];
        const typeIndex = Math.floor(Math.random() * types.length);
        SpriteConfig.textureId[eid] = types[typeIndex];
        SpriteConfig.scale[eid] = 1;
        // Color based on type for clarity
        const tints = [0xFF0000, 0x00FF00, 0x0000FF]; // R, G, B
        SpriteConfig.tint[eid] = tints[typeIndex];
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
