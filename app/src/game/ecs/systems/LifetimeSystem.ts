import { defineSystem, defineQuery, removeEntity } from 'bitecs';
import { Lifetime } from '../components';

export const createLifetimeSystem = (world: any) => {
    // 查詢所有擁有生命週期的實體
    const lifetimeQuery = defineQuery([Lifetime]);

    return defineSystem((world: any) => {
        const { dt } = world;
        const entities = lifetimeQuery(world);

        for (let i = 0; i < entities.length; ++i) {
            const id = entities[i];

            Lifetime.remaining[id] -= dt;

            if (Lifetime.remaining[id] <= 0) {
                removeEntity(world, id);
            }
        }
        return world;
    });
};
