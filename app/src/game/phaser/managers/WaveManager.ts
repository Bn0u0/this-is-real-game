import Phaser from 'phaser';
import { EventBus } from '../../../services/EventBus';
import { LootDrone } from '../entities/LootDrone';
import { ENEMY_LIBRARY } from '../../data/library/enemies';

import { addEntity, addComponent, defineQuery } from 'bitecs';
import { Transform, Velocity, Health, EnemyTag, SpriteConfig, Stats, CombatState, LootTag, Value } from '../../ecs/components';

export class WaveManager {
    private scene: Phaser.Scene;
    private world: any; // ECS World

    // [FIX] Management & Safety
    private enemyQuery: any;
    private drones: LootDrone[] = [];
    private readonly MAX_ENEMIES = 300; // ç¡¬ä???

    public wave: number = 1;
    private spawnTimer: number = 0;
    private isActive: boolean = false;

    public get currentWave(): number { return this.wave; }

    constructor(scene: Phaser.Scene, world: any) {
        this.scene = scene;
        this.world = world;

        // [FIX] Initialize Query
        this.enemyQuery = defineQuery([EnemyTag]);
    }

    public start(waveNumber: number) {
        this.isActive = true;
        this.spawnTimer = this.scene.time.now + 1000; // Delay first spawn
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
            if (this.scene && this.isActive) { // Safety check
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

        console.log(`?? [WaveManager] Supply Drone deployed at ${x},${y}`);
    }

    public onEnemyKilled(enemy: any) {
        // [FIX] Spawn Loot at enemy position
        // We need enemy transform from ECS.
        // Assuming 'enemy' passed here is merely the ID (eid) or an object with coordinates?
        // Let's assume 'enemy' is the EID, but we need coordinates BEFORE it is removed.
        // Actually, onEnemyKilled usually called BEFORE removal or we pass coordinates.
        // Let's update the signature to accept (x, y, type).
    }

    public spawnLootAt(x: number, y: number, textureId: number) {
        // Determine Type from TextureId
        // 1: Circle (Boss), 2: Square (Elite), 3: Triangle (Basic)
        let type = 'BASIC';
        if (textureId === 2) type = 'ELITE';
        if (textureId === 1) type = 'BOSS';

        this.spawnLoot(x, y, type);
    }

    public update(time: number, delta: number, survivalTime: number) {
        if (!this.isActive) return;

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

        Health.current[eid] = 1; // [DEBUG] One-hit kill for testing
        Health.max[eid] = 1;

        // [VISUAL] Semantic Shape/Color System
        // Rusted (Basic) -> Blue Triangle
        // Overgrown (Elite) -> Green Square
        // Glitched (Boss) -> Red Circle

        if (faction === 'RUSTED') {
            SpriteConfig.textureId[eid] = 3; // Triangle
            SpriteConfig.tint[eid] = 0x3B82F6; // Blue
        } else if (faction === 'OVERGROWN') {
            SpriteConfig.textureId[eid] = 2; // Square
            SpriteConfig.tint[eid] = 0x10B981; // Green
        } else {
            SpriteConfig.textureId[eid] = 1; // Circle
            SpriteConfig.tint[eid] = 0xEF4444; // Red
        }

        SpriteConfig.scale[eid] = def.visuals.scale || 1.0;
    }

    public cleanup() {
        // [CLEANUP] ECS entities are managed by systems, no Phaser Group to clear
        this.isActive = false;

        // [FIX] Cleanup Drones
        this.drones.forEach(d => d.destroy());
        this.drones = [];
    }
    private spawnLoot(x: number, y: number, enemyType: string) {
        // [LOOT LOGIC] Determine Value based on enemy type
        let value = 1;
        let scale = 0.5;
        let tint = 0xFFD700; // Gold

        if (enemyType === 'ELITE') {
            value = 10;
            scale = 0.8;
            tint = 0xFFA500; // Orange Gold
        } else if (enemyType === 'BOSS') {
            value = 100;
            scale = 1.2;
            tint = 0xFF4500; // Red Gold
        }

        // ECS Spawn
        const id = addEntity(this.world);
        addComponent(this.world, Transform, id);
        addComponent(this.world, SpriteConfig, id);
        addComponent(this.world, LootTag, id);
        addComponent(this.world, Value, id);

        // Set Data
        Transform.x[id] = x;
        Transform.y[id] = y;

        SpriteConfig.textureId[id] = 2; // Square (Pixel Loot)
        SpriteConfig.tint[id] = tint;
        SpriteConfig.scale[id] = scale;

        Value.amount[id] = value;

        // [OPTIONAL] Add Drift Velocity? 
        // For now static is fine.
    }
}
