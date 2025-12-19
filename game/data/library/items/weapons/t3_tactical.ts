import { ItemDef } from '../../../../../types';

export const T3_WEAPONS: ItemDef[] = [
    {
        id: 'weapon_thermal_katana',
        name: '熱能太刀',
        type: 'WEAPON',
        tier: 3,
        baseStats: { damage: 60, range: 100, fireRate: 350 },
        affinity: {
            classes: ['RONIN'], // 只有浪人能發揮 100%
            bonusStats: { damageMult: 1.5, effect: 'BURN' }
        },
        icon: 'icon_katana_red',
        behavior: 'MELEE_SWEEP'
    }
];
