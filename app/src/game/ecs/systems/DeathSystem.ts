import { defineSystem, defineQuery, removeEntity, enterQuery, exitQuery } from 'bitecs';
import { Health, Transform, EnemyTag, SpriteConfig } from '../components';
import { EventBus } from '../../../services/EventBus';

export const createDeathSystem = (world: any) => {
    // 查詢所有「有血量、有位置、是敵人」的實體
    const deadQuery = defineQuery([Health, Transform, EnemyTag]);

    return defineSystem((world: any) => {
        const entities = deadQuery(world);

        for (let i = entities.length - 1; i >= 0; i--) {
            const id = entities[i];

            // 檢測死亡
            if (Health.current[id] <= 0) {
                // [FIX] 在移除前，先讀取所有需要的數據
                const x = Transform.x[id];
                const y = Transform.y[id];
                const textureId = SpriteConfig.textureId[id] || 0;

                // 1. 發送死亡事件 (傳遞完整數據，避免 EID 被回收後讀取錯誤)
                EventBus.emit('ENEMY_KILLED_AT', { x, y, textureId });

                // 2. 從 ECS 世界移除實體
                removeEntity(world, id);
            }
        }
        return world;
    });
};
