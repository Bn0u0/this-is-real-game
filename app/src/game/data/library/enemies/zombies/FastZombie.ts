import { EnemyDef } from '../../../../../types';

export const ZOMBIE_SPRINTER: EnemyDef = {
    id: 'enemy_zombie_sprinter',
    name: 'Sprinter',
    tier: 1,
    tags: ['ZOMBIE', 'BIOLOGICAL'],

    stats: {
        hp: 60,
        speed: 120, // Very fast
        damage: 8,
        mass: 0.8,  // Easy to knockback
        exp: 15
    },

    visuals: {
        texture: 'tex_enemy',
        color: 0xFFAA00, // Orange
        scale: 0.6
    },

    ai: {
        type: 'CHASE'
    },

    spawnRules: {
        minWave: 3,
        cost: 2,
        weight: 30
    }
};
