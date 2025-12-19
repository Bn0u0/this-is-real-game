import { ItemDef } from '../../../../../types';

export const T1_WEAPONS: ItemDef[] = [
    {
        id: 'w_nailgun_t1',
        name: '改造釘槍 (Nailgun)',
        type: 'WEAPON',
        tier: 1,
        rarity: 'COMMON',
        behavior: 'PISTOL_SHOT', // 高射速單發
        baseStats: { damage: 8, range: 300, fireRate: 120, speed: 800, knockback: 10 },
        description: '工業用的釘槍，現在用來釘頭骨。射速快但準度堪憂。',
        icon: 'weapon_nailgun'
    },
    {
        id: 'w_pipe_wrench_t1',
        name: '重型管鉗 (Pipe Wrench)',
        type: 'WEAPON',
        tier: 1,
        rarity: 'COMMON',
        behavior: 'MELEE_SWEEP', // 近戰橫掃
        baseStats: { damage: 35, range: 80, fireRate: 900, knockback: 250 },
        description: '修水管的工具，或者修理不聽話的拾荒者。',
        icon: 'weapon_wrench'
    },
    {
        id: 'w_scrap_shotgun_t1',
        name: '土製噴子 (Scrap Shotgun)',
        type: 'WEAPON',
        tier: 1,
        rarity: 'COMMON',
        behavior: 'PISTOL_SHOT',
        baseStats: { damage: 6, range: 200, fireRate: 1200, speed: 600, knockback: 50 },
        // 注意：WeaponSystem 需支援 projectileCount，此處為 5 發散彈
        stats: { projectileCount: 5, spread: 0.5 },
        description: '一次發射一堆廢鐵片。近距離致命。',
        icon: 'weapon_scrap_shotgun'
    }
];
