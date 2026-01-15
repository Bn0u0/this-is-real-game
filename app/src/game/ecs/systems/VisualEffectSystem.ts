import { defineSystem, defineQuery } from 'bitecs';
import { VisualEffect } from '../components';

export const createVisualEffectSystem = () => {
    const query = defineQuery([VisualEffect]);

    return defineSystem((world: any) => {
        const entities = query(world);
        const dt = world.dt || 16.6; // Get delta time from world

        for (let i = 0; i < entities.length; ++i) {
            const id = entities[i];

            if (VisualEffect.flashTimer[id] > 0) {
                VisualEffect.flashTimer[id] -= dt;
                if (VisualEffect.flashTimer[id] < 0) {
                    VisualEffect.flashTimer[id] = 0;
                }
            }
        }

        return world;
    });
};
