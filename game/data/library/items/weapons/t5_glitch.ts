import { ItemDef } from '../../../../../types';

export const T5_WEAPONS: ItemDef[] = [
    {
        id: 'weapon_sakura',
        name: '櫻吹雪 (Sakura)',
        type: 'WEAPON',
        tier: 5,
        baseStats: { damage: 120, range: 150, fireRate: 100 },
        requirements: { requiredClass: ['RONIN'] }, // 硬鎖定：非浪人不可用
        icon: 'icon_katana_pink',
        behavior: 'MELEE_SWEEP'
    }
];
