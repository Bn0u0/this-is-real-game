import Phaser from 'phaser';
import { EventBus } from '../../services/EventBus';
// [REMOVED] Imports
// import { Enemy } from '../classes/Enemy';
// import { EnemyFactory } from '../factories/EnemyFactory';
// import { ObjectPool } from '../core/ObjectPool';
import { LootDrone } from '../entities/LootDrone';
import { ENEMY_LIBRARY } from '../data/library/enemies';

import { addEntity, addComponent } from 'bitecs';
import { Transform, Velocity, Health, EnemyTag, SpriteConfig } from '../ecs/Components';

export class WaveManager {
    private scene: Phaser.Scene;
    private enemyGroup: Phaser.GameObjects.Group;
    // private pool: ObjectPool<Enemy>; // [REMOVED]
    private world: any; // ECS World

    public wave: number = 1;

    private spawnTimer: number = 0;

    public get currentWave(): number { return this.wave; }

    constructor(scene: Phaser.Scene, enemyGroup: Phaser.GameObjects.Group, world: any) {
        this.scene = scene;
        this.enemyGroup = enemyGroup;
        this.world = world;

        // [REMOVED] OOP Pool Initialization
        /*
        this.pool = new ObjectPool<Enemy>(
            () => { ... },
            50, 200
        );
        */
    }

    public start(waveNumber: number) {
        this.startWave(waveNumber);
    }

    public startWave(waveNumber: number) {
        this.wave = waveNumber;
        EventBus.emit('WAVE_START', { wave: this.wave });

        console.log(`[WaveManager] Wave ${waveNumber} Initialized. System Online.`);

        // [OPERATION DUAL-TRACK]
        // Schedule Supply Drones
        this.scheduleNextDrone();
    }

    private scheduleNextDrone() {
        // 3~5 Minutes (180s ~ 300s) -> Converted to ms
        const delay = Phaser.Math.Between(180000, 300000);
        this.scene.time.delayedCall(delay, () => {
            this.spawnLootDrone();
            this.scheduleNextDrone(); // Loop
        });
    }

    private spawnLootDrone() {
        const x = Phaser.Math.Between(500, 3500); // Inner bounds
        const y = Phaser.Math.Between(500, 3500);

        // Create Drone
        const drone = new LootDrone(this.scene, x, y);

        // [FIX] Self-cleaning Update Listener to prevent Memory Leak
        const updateListener = (time: number, delta: number) => {
            if (drone.scene && drone.active) {
                drone.tick(time, delta, (this.scene as any).commander);
            } else {
                // Drone destroyed or scene changed, remove listener
                this.scene.events.off('update', updateListener);
                // console.log("[WaveManager] Drone Listener Cleaned Up");
            }
        };
        this.scene.events.on('update', updateListener);

        console.log(`🚁 [WaveManager] Supply Drone deployed at ${x},${y}`);
    }

    public onEnemyKilled(enemy: any) {
        // Handle score or wave progress here
    }

    public update(time: number, delta: number) {
        // [OPERATION BESTIARY]
        // Spawning Logic Re-activated

        // Spawn Rate: 1 per 0.5s ? (High density)
        if (time > this.spawnTimer) {
            this.spawnEnemy();
            this.spawnTimer = time + 500; // 500ms
        }

        // [REMOVED] OOP Update Loop
        // ECS handles movement/rendering now.
        /*
        const children = this.enemyGroup.getChildren() as Enemy[];
        for (let i = children.length - 1; i >= 0; i--) {
            const enemy = children[i];
            if (enemy.active) {
                const player = (this.scene as any).commander;
                if (player) enemy.update(time, delta, player);
            } else {
                this.pool.release(enemy);
            }
        }
        */
    }

    private spawnEnemy() {
        // 1. Pick Strategy based on Game Time (or just random for now)
        // Let's mix Rusted (80%) and Overgrown (20%) initially
        // Glitched only after some condition? Let's just do random weighted for Playtest.

        const roll = Math.random();
        let faction = 'RUSTED';
        if (roll > 0.8) faction = 'OVERGROWN';
        if (roll > 0.95) faction = 'GLITCHED';

        const defs = ENEMY_LIBRARY.getByFaction(faction);
        if (defs.length === 0) return;

        const def = defs[Math.floor(Math.random() * defs.length)];

        // 2. Position (Orbit near player)
        const player = (this.scene as any).commander;
        if (!player) return;

        // Spawn circle
        const angle = Math.random() * Math.PI * 2;
        const radius = 800; // Offscreen
        const sx = player.x + Math.cos(angle) * radius;
        const sy = player.y + Math.sin(angle) * radius;

        // 3. Pool
        // [ADAPTER] ECS Spawn
        const eid = addEntity(this.world);

        // Components
        addComponent(this.world, Transform, eid);
        addComponent(this.world, Velocity, eid);
        addComponent(this.world, Health, eid);
        addComponent(this.world, SpriteConfig, eid);
        addComponent(this.world, EnemyTag, eid);

        // Init Data
        Transform.x[eid] = sx;
        Transform.y[eid] = sy;

        // Simple chasing logic needs to be in a System, 
        // for now just give it a nudge towards player to verify spawn
        const angleToPlayer = Math.atan2(player.y - sy, player.x - sx);
        const speed = 50;
        Velocity.x[eid] = Math.cos(angleToPlayer) * speed;
        Velocity.y[eid] = Math.sin(angleToPlayer) * speed;

        Health.current[eid] = 50;
        Health.max[eid] = 50;

        // View
        SpriteConfig.textureId[eid] = 2; // 'tex_enemy_01'? Need to Map
        SpriteConfig.scale[eid] = 1.0;
        SpriteConfig.tint[eid] = 0xFF0000; // Red Enemy

        // OOP Pool Fallback (Optional: Keep it for logic update if we still use update loop?)
        // For now, only ECS to test pure ECS.
        // const enemy = this.pool.get(); ... [DISABLED]
    }

    public cleanup() {
        this.enemyGroup.clear(true, true);
    }
}
