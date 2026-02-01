import { EnemyDef } from '../../../../../types';

export const ZOMBIE_WALKER: EnemyDef = {
    id: 'enemy_zombie_walker',
    name: 'Walker',
    tier: 1,
    tags: ['ZOMBIE', 'BIOLOGICAL'],

    stats: {
        hp: 100,
        speed: 50,
        damage: 10,
        mass: 1.0,
        exp: 10
    },

    visuals: {
        texture: 'tex_enemy', // Placeholder
        color: 0x33FF33,      // Green-ish
        scale: 0.8
    },

    ai: {
        type: 'CHASE'
    },

    spawnRules: {
        minWave: 1,
        cost: 1,
        weight: 100
    }
};
