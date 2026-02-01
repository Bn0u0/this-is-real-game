import { ItemDef } from '../../../../../types';

/**
 * T3: 稀有級工業武器
 * 概念: 改造過的工業設備和舊時代民用武器
 */
export const T3_WEAPONS: ItemDef[] = [
    {
        id: 'weapon_pistol_t3',
        name: '老夥計 (Pistol)',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 3,
        rarity: 'RARE',
        baseStats: { damage: 20, range: 450, fireRate: 500, speed: 1.0, critChance: 0.1, defense: 0, hpMax: 0 },
        description: '經過精心保養的老式手槍。可靠且精準。',
        icon: 'weapon_pistol',
        behavior: 'PISTOL_SHOT',
        visualCategory: 'PISTOL',
        controlType: 'HYBRID',
        siegeBehavior: 'MOONWALK_LASER',
        orbitConfig: { radius: 50, speed: 2.5 }
    },
    // [MOVED FROM T4] 改造釘槍 - 需要電力，屬於工業級
    {
        id: 'w_nailgun_t3',
        name: '改造釘槍 (Nailgun)',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 3,
        rarity: 'RARE',
        behavior: 'PISTOL_SHOT',
        baseStats: { damage: 10, range: 320, fireRate: 100, speed: 850, critChance: 0.05, defense: 0, hpMax: 0 },
        description: '工業用的釘槍，現在用來釘頭骨。射速快但準度堪憂。',
        icon: 'weapon_nailgun',
        controlType: 'HYBRID',
        siegeBehavior: 'RETICLE_FOCUS',
        orbitConfig: { radius: 50, speed: 3.0 }
    }
];
