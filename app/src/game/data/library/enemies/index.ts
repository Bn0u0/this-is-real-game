import { EnemyDef } from '../../../../types';

// A. Rusted Faction (Melee Swarm)
export const RUSTED_ENEMIES: EnemyDef[] = [
    {
        id: 'e_rusted_zombie',
        name: '銹蝕行者',
        faction: 'RUSTED',
        tier: 1,
        behavior: 'CHASER',
        stats: { hp: 50, speed: 120, damage: 10, attackRange: 30 },
        visuals: { color: 0xCC6600, scale: 1 }
    }
];

// B. Overgrown Faction (Ranged Static)
export const OVERGROWN_ENEMIES: EnemyDef[] = [
    {
        id: 'e_overgrown_spitter',
        name: '孢子射手',
        faction: 'OVERGROWN',
        tier: 1,
        behavior: 'SHOOTER',
        stats: { hp: 30, speed: 50, damage: 20, attackRange: 400 },
        visuals: { color: 0x44AA44, scale: 0.8 }
    }
];

// C. Glitched Faction (Teleporting Assassin)
export const GLITCHED_ENEMIES: EnemyDef[] = [
    {
        id: 'e_glitch_ghost',
        name: '邏輯錯誤',
        faction: 'GLITCHED',
        tier: 1,
        behavior: 'TELEPORTER',
        stats: { hp: 40, speed: 200, damage: 30, attackRange: 100 },
        visuals: { color: 0x00FFFF, scale: 0.9, effect: 'flicker' }
    }
];

export const ENEMY_LIBRARY = {
    getAll: () => [...RUSTED_ENEMIES, ...OVERGROWN_ENEMIES, ...GLITCHED_ENEMIES],
    getByFaction: (faction: string) => {
        if (faction === 'RUSTED') return RUSTED_ENEMIES;
        if (faction === 'OVERGROWN') return OVERGROWN_ENEMIES;
        if (faction === 'GLITCHED') return GLITCHED_ENEMIES;
        return [];
    },
    getRandom: () => {
        const all = [...RUSTED_ENEMIES, ...OVERGROWN_ENEMIES, ...GLITCHED_ENEMIES];
        return all[Math.floor(Math.random() * all.length)];
    }
};
