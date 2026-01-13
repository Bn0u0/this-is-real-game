import { defineSystem, defineQuery } from 'bitecs';
import { Transform, EnemyTag } from '../Components';

export const createPlayerCollisionSystem = (world: any) => {
    const enemyQuery = defineQuery([Transform, EnemyTag]);

    return defineSystem((world: any) => {
        // 如果沒有玩家位置數據，直接跳過
        if (world.playerX === undefined || world.playerY === undefined) return world;

        const enemies = enemyQuery(world);
        const playerRadius = 20; // 玩家碰撞半徑
        const enemyRadius = 20;  // 敵人碰撞半徑
        const killDistSq = (playerRadius + enemyRadius) ** 2;

        let totalDamage = 0;

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

        // 將傷害寫入 world context，交由 MainScene 處理
        world.playerDamageAccumulator = (world.playerDamageAccumulator || 0) + totalDamage;

        return world;
    });
};
