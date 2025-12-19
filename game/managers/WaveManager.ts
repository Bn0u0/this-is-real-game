import Phaser from 'phaser';
import { EventBus } from '../../services/EventBus';
import { Enemy } from '../classes/Enemy';
// import { EnemyFactory } from '../factories/EnemyFactory'; // Deprecated
import { ObjectPool } from '../core/ObjectPool';
import { LootDrone } from '../entities/LootDrone';
import { ENEMY_LIBRARY } from '../data/library/enemies';

export class WaveManager {
    private scene: Phaser.Scene;
    private enemyGroup: Phaser.GameObjects.Group;
    private pool: ObjectPool<Enemy>;

    public wave: number = 1;

    private spawnTimer: number = 0;

    constructor(scene: Phaser.Scene, enemyGroup: Phaser.GameObjects.Group) {
        this.scene = scene;
        this.enemyGroup = enemyGroup;

        // Initialize Pool
        this.pool = new ObjectPool<Enemy>(
            () => {
                const enemy = new Enemy(scene, 0, 0);
                this.enemyGroup.add(enemy);
                enemy.setActive(false).setVisible(false);
                return enemy;
            },
            50, 200
        );
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

    public update(time: number, delta: number) {
        // [OPERATION BESTIARY]
        // Spawning Logic Re-activated

        // Spawn Rate: 1 per 0.5s ? (High density)
        if (time > this.spawnTimer) {
            this.spawnEnemy();
            this.spawnTimer = time + 500; // 500ms
        }

        // Return dead enemies to pool
        const children = this.enemyGroup.getChildren() as Enemy[];
        for (let i = children.length - 1; i >= 0; i--) {
            const enemy = children[i];

            // Logic Update
            if (enemy.active) {
                // HACK: Pass player (commander)
                const player = (this.scene as any).commander;
                if (player) enemy.update(time, delta, player);
            } else {
                this.pool.release(enemy);
            }
        }
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
        const enemy = this.pool.get();
        if (enemy) {
            enemy.setPosition(sx, sy);
            enemy.configure(def); // Inject Data
            enemy.onEnable();
        }
    }

    public cleanup() {
        this.enemyGroup.clear(true, true);
    }
}
