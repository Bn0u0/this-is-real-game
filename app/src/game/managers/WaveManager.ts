import Phaser from 'phaser';
import { EventBus } from '../../services/EventBus';
import { LootDrone } from '../entities/LootDrone';
import { ENEMY_LIBRARY } from '../data/library/enemies';

import { addEntity, addComponent, defineQuery } from 'bitecs';
import { Transform, Velocity, Health, EnemyTag, SpriteConfig, Stats, CombatState } from '../ecs/Components';

export class WaveManager {
    private scene: Phaser.Scene;
    private enemyGroup: Phaser.GameObjects.Group;
    private world: any; // ECS World

    // [FIX] Management & Safety
    private enemyQuery: any;
    private drones: LootDrone[] = [];
    private readonly MAX_ENEMIES = 300; // 硬上限

    public wave: number = 1;

    private spawnTimer: number = 0;

    public get currentWave(): number { return this.wave; }

    constructor(scene: Phaser.Scene, enemyGroup: Phaser.GameObjects.Group, world: any) {
        this.scene = scene;
        this.enemyGroup = enemyGroup;
        this.world = world;

        // [FIX] Initialize Query
        this.enemyQuery = defineQuery([EnemyTag]);
    }

    public start(waveNumber: number) {
        this.startWave(waveNumber);
    }

    public startWave(waveNumber: number) {
        this.wave = waveNumber;
        EventBus.emit('WAVE_START', { wave: this.wave });

        console.log(`[WaveManager] Wave ${waveNumber} Initialized. System Online.`);

        this.scheduleNextDrone();
    }

    private scheduleNextDrone() {
        // 3~5 Minutes
        const delay = Phaser.Math.Between(180000, 300000);
        this.scene.time.delayedCall(delay, () => {
            if (this.scene) { // Safety check
                this.spawnLootDrone();
                this.scheduleNextDrone(); // Loop
            }
        });
    }

    private spawnLootDrone() {
        const x = Phaser.Math.Between(500, 3500);
        const y = Phaser.Math.Between(500, 3500);

        const drone = new LootDrone(this.scene, x, y);
        this.drones.push(drone); // [FIX] Add to list

        console.log(`🚁 [WaveManager] Supply Drone deployed at ${x},${y}`);
    }

    public onEnemyKilled(enemy: any) {
        // Handle score or wave progress here
    }

    public update(time: number, delta: number, survivalTime: number) {
        // [FIX] Update Drones safely
        for (let i = this.drones.length - 1; i >= 0; i--) {
            const drone = this.drones[i];
            if (drone.active) {
                // Assuming MainScene puts player in 'commander' or we get it via PlayerManager
                // But Loop is simpler:
                const player = (this.scene as any).playerManager?.myUnit;
                if (player) drone.tick(time, delta, player);
            } else {
                this.drones.splice(i, 1);
            }
        }

        // Spawning Logic with Progression
        let spawnInterval = 1000;
        if (survivalTime > 60) spawnInterval = 800;
        if (survivalTime > 120) spawnInterval = 500;
        if (survivalTime > 300) spawnInterval = 200;

        if (time > this.spawnTimer) {
            // [FIX] Cap Limit
            const count = this.enemyQuery(this.world).length;

            if (count < this.MAX_ENEMIES) {
                this.spawnEnemy(survivalTime);
            }

            this.spawnTimer = time + spawnInterval;
        }
    }

    private spawnEnemy(survivalTime: number) {
        // 1. Pick Strategy based on Survival Time
        let faction = 'RUSTED';

        if (survivalTime < 30) {
            faction = 'RUSTED';
        } else if (survivalTime < 90) {
            if (Math.random() > 0.8) faction = 'OVERGROWN';
        } else {
            const roll = Math.random();
            if (roll > 0.9) faction = 'GLITCHED';
            else if (roll > 0.7) faction = 'OVERGROWN';
            else faction = 'RUSTED';
        }

        const defs = ENEMY_LIBRARY.getByFaction(faction);
        if (defs.length === 0) return;

        const def = defs[Math.floor(Math.random() * defs.length)];

        // 2. Position (Orbit near player)
        // Get Player safely
        let player = (this.scene as any).playerManager?.myUnit;
        if (!player) player = (this.scene as any).commander; // Fallback

        if (!player) return;

        const angle = Math.random() * Math.PI * 2;
        const radius = 800;
        const sx = player.x + Math.cos(angle) * radius;
        const sy = player.y + Math.sin(angle) * radius;

        // 3. ECS Spawn
        const eid = addEntity(this.world);

        addComponent(this.world, Transform, eid);
        addComponent(this.world, Velocity, eid);
        addComponent(this.world, Health, eid);
        addComponent(this.world, SpriteConfig, eid);
        addComponent(this.world, EnemyTag, eid);
        addComponent(this.world, Stats, eid);
        addComponent(this.world, CombatState, eid);

        Transform.x[eid] = sx;
        Transform.y[eid] = sy;

        Stats.speed[eid] = def.stats.speed;
        Stats.damage[eid] = def.stats.damage;
        Stats.attackRange[eid] = def.stats.attackRange || 0;

        CombatState.lastAttackTime[eid] = 0;
        CombatState.cooldown[eid] = 2000;

        const angleToPlayer = Math.atan2(player.y - sy, player.x - sx);
        Velocity.x[eid] = Math.cos(angleToPlayer) * def.stats.speed;
        Velocity.y[eid] = Math.sin(angleToPlayer) * def.stats.speed;

        Health.current[eid] = def.stats.hp;
        Health.max[eid] = def.stats.hp;

        SpriteConfig.textureId[eid] = 2; // 'tex_enemy_01'
        SpriteConfig.scale[eid] = def.visuals.scale || 1.0;
        SpriteConfig.tint[eid] = def.visuals.color;
    }

    public cleanup() {
        this.enemyGroup.clear(true, true);

        // [FIX] Cleanup Drones
        this.drones.forEach(d => d.destroy());
        this.drones = [];
    }
}
