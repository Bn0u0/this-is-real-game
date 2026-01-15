import { defineSystem, defineQuery, removeEntity } from 'bitecs';
import { Transform, EnemyTag, ProjectileTag, Damage, LootTag, Value } from '../components';
import { EventBus } from '../../../services/EventBus';

export const createPlayerCollisionSystem = (world: any) => {
    const enemyQuery = defineQuery([Transform, EnemyTag]);
    // [NEW] Query for Enemy Projectiles
    const projectileQuery = defineQuery([Transform, ProjectileTag, Damage]);
    // [NEW] Query for Loot
    const lootQuery = defineQuery([Transform, LootTag, Value]);

    return defineSystem((world: any) => {
        // 如果沒有玩家位置數據，直接跳過
        if (world.playerX === undefined || world.playerY === undefined) return world;

        const enemies = enemyQuery(world);
        const projectiles = projectileQuery(world);
        const playerRadius = 20; // 玩家碰撞半徑
        const enemyRadius = 20;  // 敵人碰撞半徑
        const projectileRadius = 10; // 子彈半徑
        const killDistSq = (playerRadius + enemyRadius) ** 2;
        const projectileKillDistSq = (playerRadius + projectileRadius) ** 2;

        let totalDamage = 0;

        // 1. Enemy Body Collision (Touch Damage)
        for (let i = 0; i < enemies.length; ++i) {
            const id = enemies[i];
            const dx = Transform.x[id] - world.playerX;
            const dy = Transform.y[id] - world.playerY;
            const distSq = dx * dx + dy * dy;

            if (distSq < killDistSq) {
                // 敵人接觸玩家：每幀造成輕微傷害
                totalDamage += 0.5;
            }
        }

        // 2. Enemy Projectile Collision
        for (let i = 0; i < projectiles.length; ++i) {
            const pid = projectiles[i];

            // 確保是敵人的子彈 (Owner 0)
            if (Damage.ownerId[pid] !== 0) continue;

            const dx = Transform.x[pid] - world.playerX;
            const dy = Transform.y[pid] - world.playerY;
            const distSq = dx * dx + dy * dy;

            if (distSq < projectileKillDistSq) {
                // 子彈擊中玩家
                totalDamage += Damage.value[pid] || 10;

                // 銷毀子彈
                removeEntity(world, pid);
            }
        }

        // 3. Loot Pickup Collision
        const loots = lootQuery(world);
        const pickupDistSq = (playerRadius + 15) ** 2; // Slightly larger pickup range

        for (let i = 0; i < loots.length; ++i) {
            const lid = loots[i];
            const dx = Transform.x[lid] - world.playerX;
            const dy = Transform.y[lid] - world.playerY;
            const distSq = dx * dx + dy * dy;

            if (distSq < pickupDistSq) {
                // Pick up loot
                const val = Value.amount[lid] || 1;

                // Emit event to Session Service
                EventBus.emit('LOOT_PICKUP', { value: val });

                // Remove from World
                removeEntity(world, lid);
            }
        }

        // 將傷害寫入 world context，交由 MainScene 處理
        world.playerDamageAccumulator = (world.playerDamageAccumulator || 0) + totalDamage;

        return world;
    });
};
