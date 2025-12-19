import { ItemDef } from '../../../../../types';

export const T4_WEAPONS: ItemDef[] = [
    {
        id: 'w_railgun_t4',
        name: '磁軌砲 (Railgun)',
        type: 'WEAPON',
        tier: 4,
        rarity: 'LEGENDARY',
        behavior: 'LASER',
        baseStats: { damage: 400, range: 1500, fireRate: 2500, knockback: 800 },
        stats: { sizeMod: 3 }, // 更粗的光束
        description: '以電磁力加速彈丸至 8 馬赫。無視任何護甲。',
        icon: 'weapon_railgun'
    },
    {
        id: 'w_funnels_t4',
        name: '浮游砲陣列 (Funnel System)',
        type: 'WEAPON',
        tier: 4,
        rarity: 'LEGENDARY',
        behavior: 'HOMING_ORB', // 追蹤法球
        baseStats: { damage: 60, range: 800, fireRate: 300, speed: 600 },
        affinity: { classes: ['WEAVER', 'ARCHITECT'], bonusStats: { projectileCount: 2 } }, // 編織者一次射2發
        description: '精神感應控制的無人攻擊單元。自動索敵。',
        icon: 'weapon_funnels'
    }
];
