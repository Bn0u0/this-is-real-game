import { ItemDef } from '../../../../../types';

export const T5_WEAPONS: ItemDef[] = [
    {
        id: 'w_reality_slicer_t5',
        name: '現實切割者 (Reality Slicer)',
        type: 'WEAPON',
        tier: 5,
        rarity: 'GLITCH',
        behavior: 'MELEE_SWEEP',
        baseStats: { damage: 999, range: 300, fireRate: 1000, knockback: 1000 },
        stats: { sizeMod: 5 }, // 巨大攻擊範圍
        description: 'ERROR: WEAPON_DATA_CORRUPTED. 切割空間本身的錯誤代碼。',
        icon: 'weapon_glitch_sword'
    },
    {
        id: 'w_glitch_storm_t5',
        name: '溢位風暴 (Overflow Storm)',
        type: 'WEAPON',
        tier: 5,
        rarity: 'GLITCH',
        behavior: 'DRONE_BEAM',
        baseStats: { damage: 50, range: 1000, fireRate: 100 }, // 每秒10跳
        description: '直接對視野內所有目標的內存地址進行寫入攻擊。',
        icon: 'weapon_glitch_orb'
    }
];
