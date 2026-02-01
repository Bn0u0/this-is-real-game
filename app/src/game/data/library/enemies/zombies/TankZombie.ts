import { EnemyDef } from '../../../../../types';

export const ZOMBIE_TANK: EnemyDef = {
    id: 'enemy_zombie_tank',
    name: 'Tank',
    tier: 2,
    tags: ['ZOMBIE', 'BIOLOGICAL', 'HEAVY'],

    stats: {
        hp: 500,
        speed: 30,    // Slow
        damage: 25,
        mass: 5.0,    // Hard to knockback
        exp: 50
    },

    visuals: {
        texture: 'tex_enemy',
        color: 0x880000, // Dark Red
        scale: 1.5
    },

    ai: {
        type: 'CHASE'
    },

    spawnRules: {
        minWave: 5,
        cost: 10,
        weight: 10
    }
};
