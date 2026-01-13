import Phaser from 'phaser';
import { Player } from '../classes/Player';
// import { Enemy } from '../classes/Enemy'; [REMOVED]
// import { Projectile } from '../classes/Projectile'; [REMOVED]
import { EventBus } from '../../services/EventBus';
import { MainScene } from '../scenes/MainScene';
// import { ObjectPool } from '../core/ObjectPool'; [REMOVED]

export class CombatManager {
    private scene: MainScene;
    // private projectilePool: ObjectPool<Projectile>;
    // private projectiles: Phaser.GameObjects.Group;

    constructor(scene: MainScene) {
        this.scene = scene;
        /*
        this.projectiles = scene.physics.add.group({
            classType: Projectile,
            runChildUpdate: true
        });

        // Initialize Projectile Pool
        this.projectilePool = new ObjectPool<Projectile>(
            () => {
                const p = new Projectile(scene);
                this.projectiles.add(p); // Add to the group for physics and updates
                return p;
            },
            50, // Initial pool size
            200 // Max pool size
        );
        */

        // [NEW] Event Listeners for Strategy Interactions
        // [FIXME] These handlers relied on OOP Enemy. Disabled for Phase 2/3.
        // EventBus.on('COMBAT_HIT_SCAN', this.handleHitScan, this);
        // EventBus.on('COMBAT_AREA_ATTACK', this.handleAreaAttack, this);
    }

    /*
    // [NEW] Hit Scan Logic
    private handleHitScan(data: { x1: number, y1: number, x2: number, y2: number, damage: number, ownerId: string }) {
       // ... OOP Logic Removed ...
    }
    */

    /*
    // [NEW] Area Attack Logic
    private handleAreaAttack(data: { x: number, y: number, radius: number, angle: number, arc: number, damage: number, ownerId: string }) {
        // ... OOP Logic Removed ...
    }
    */

    /*
    private applyDamage(enemy: any, damage: number, isKnockback: boolean) {
        // ... OOP Logic Removed ...
    }
    */

    public spawnProjectile(x: number, y: number, angle: number, ownerId: string, damage: number) {
        // [DEPRECATED] Use WeaponSystem (ECS)
        console.warn('CombatManager.spawnProjectile is deprecated. Use WeaponSystem.');
    }

    public update(time: number, delta: number) {
        /*
        // Cleanup dead projectiles
        const children = this.projectiles.getChildren() as Projectile[];
        for (let i = children.length - 1; i >= 0; i--) {
            const p = children[i];
            if (!p.active) {
                this.projectilePool.release(p);
            }
        }
        */
    }

    public checkCollisions(
        enemyGroup: Phaser.GameObjects.Group,
        players: Player[],
        onPlayerDamaged: (amount: number) => void,
        externalProjectiles?: Phaser.GameObjects.Group
    ) {
        // [ADAPTER] Disabling OOP Collision
        // Logic moved to ECS CollisionSystem.
    }

    /*
    private handleHit(projectile: any, enemy: any) {
       // ...
    }
    */

    public updateCombatAI(commander: Player, drone: Player | null, enemyGroup: Phaser.GameObjects.Group, projectileGroup: Phaser.GameObjects.Group) {
        // [DEPRECATED] AI handled by ChaseSystem (ECS)
        // commander.updateCombat(enemyGroup, projectileGroup);
        // if (drone) drone.updateCombat(enemyGroup, projectileGroup);
    }
}
