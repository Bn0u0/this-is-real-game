import { defineSystem, defineQuery } from 'bitecs';
import { Transform, EnemyTag, Stats, AttackCooldown } from '../components';

export const createEnemyAttackSystem = (world: any) => {
    // Query enemies that can attack (have Stats and AttackCooldown)
    const query = defineQuery([Transform, EnemyTag, Stats, AttackCooldown]);

    return defineSystem((world: any) => {
        // [INPUT] Needs Player Position
        if (world.playerX === undefined || world.playerY === undefined) return world;

        const enemies = query(world);
        const playerRadius = 20;
        const enemyRadius = 20;
        const meleeRangeSq = (playerRadius + enemyRadius) ** 2;
        const now = world.time || 0;

        let totalDamage = 0;

        for (let i = 0; i < enemies.length; ++i) {
            const id = enemies[i];

            const dx = world.playerX - Transform.x[id];
            const dy = world.playerY - Transform.y[id];
            const distSq = dx * dx + dy * dy;

            // Melee Attack Check
            if (distSq < meleeRangeSq) {
                const lastHit = AttackCooldown.lastHitTime[id];
                const cd = AttackCooldown.cooldown[id] || 500;

                if (now > lastHit + cd) {
                    // [ACTION] Attack!
                    const dmg = Stats.damage[id] || 10;
                    totalDamage += dmg;
                    AttackCooldown.lastHitTime[id] = now;

                    // [PHYSICS] Calculate Knockback
                    // Vector: Enemy -> Player (Normal)
                    const len = Math.sqrt(distSq) || 1; // Prevent div0
                    const nx = dx / len;
                    const ny = dy / len;

                    // Accumulate Knockback (Force = 150)
                    world.knockbackX = (world.knockbackX || 0) + (nx * 150);
                    world.knockbackY = (world.knockbackY || 0) + (ny * 150);
                }
            }
        }

        // Write total damage to world for MainScene to consume
        world.playerDamageAccumulator = (world.playerDamageAccumulator || 0) + totalDamage;

        return world;
    });
};
