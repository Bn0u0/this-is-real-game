import { defineSystem, defineQuery, removeEntity, enterQuery, exitQuery } from 'bitecs';
import { Health, Transform, EnemyTag } from '../Components';
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
                const x = Transform.x[id];
                const y = Transform.y[id];

                // 1. 發送死亡事件 (通知 MainScene 掉寶與加分)
                // 傳遞 tier = 1 (之後可從組件讀取)
                EventBus.emit('ENEMY_KILLED_AT', { x, y, tier: 1 });

                // 2. 從 ECS 世界移除實體
                removeEntity(world, id);
            }
        }
        return world;
    });
};
