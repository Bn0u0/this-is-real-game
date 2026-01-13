import { defineSystem, defineQuery } from 'bitecs';
import { Transform, Velocity, EnemyTag } from '../Components';

export const createChaseSystem = (world: any) => {
    // 查詢所有「是敵人」且「有位置、有速度」的實體
    const enemyQuery = defineQuery([Transform, Velocity, EnemyTag]);

    return defineSystem((world: any) => {
        // 從 world context 獲取玩家位置 (需要在 MainScene 更新時注入)
        const playerX = world.playerX || 0;
        const playerY = world.playerY || 0;

        const entities = enemyQuery(world);
        const speed = 50; // 暫時寫死，之後可以從 Component 讀取 (例如 Stats.speed)

        for (let i = 0; i < entities.length; ++i) {
            const id = entities[i];

            // 簡單的追蹤邏輯：計算指向玩家的角度
            const angle = Math.atan2(playerY - Transform.y[id], playerX - Transform.x[id]);

            // 更新速度向量
            Velocity.x[id] = Math.cos(angle) * speed;
            Velocity.y[id] = Math.sin(angle) * speed;

            // 可選：更新旋轉角度讓圖片面向玩家 (如果有 Rotation Component)
            Transform.rotation[id] = angle;
        }

        return world;
    });
};
