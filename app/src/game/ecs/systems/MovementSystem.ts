import { defineSystem, defineQuery } from 'bitecs';
import { Transform, Velocity } from '../components';

export const createMovementSystem = (world: any) => {
    // 查詢所有同時擁有 Transform 和 Velocity 的實體
    const movingQuery = defineQuery([Transform, Velocity]);

    return defineSystem((world: any) => {
        const { dt } = world; // 預期 world 中會注入 dt (delta time)
        const entities = movingQuery(world);

        for (let i = 0; i < entities.length; ++i) {
            const id = entities[i];
            // 簡單的尤拉積分：位置 += 速度 * 時間
            // 假設 dt 單位是 ms，速度單位是 px/s，所以要 * 0.001
            Transform.x[id] += Velocity.x[id] * dt * 0.001;
            Transform.y[id] += Velocity.y[id] * dt * 0.001;
        }
        return world;
    });
};
