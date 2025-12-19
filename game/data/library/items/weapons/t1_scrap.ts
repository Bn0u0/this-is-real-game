import { ItemDef } from '../../../../../types';

export const T1_WEAPONS: ItemDef[] = [
    {
        id: 'weapon_pipe_wrench',
        name: '水管鉗',
        type: 'WEAPON',
        tier: 1,
        baseStats: { damage: 25, range: 70, fireRate: 800 }, // 慢但在痛
        icon: 'icon_scrap_metal',
        behavior: 'MELEE_SWEEP'
    },
    {
        id: 'weapon_nailgun',
        name: '改造釘槍',
        type: 'WEAPON',
        tier: 1,
        baseStats: { damage: 8, range: 250, fireRate: 150 }, // 超快射速
        icon: 'ammo_pip',
        behavior: 'PISTOL_SHOT'
    }
];
