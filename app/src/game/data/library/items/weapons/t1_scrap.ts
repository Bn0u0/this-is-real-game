import { ItemDef } from '../../../../../types';

/**
 * T1: 傳說級高科技武器
 * 概念: 尖端科技的極致兵器
 */
export const T1_WEAPONS: ItemDef[] = [
    {
        id: 'w_railgun_t1',
        name: '磁軌砲 (Railgun)',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 1,
        rarity: 'LEGENDARY',
        behavior: 'LASER',
        baseStats: { damage: 400, range: 1500, fireRate: 2500, speed: 9999, critChance: 0.5, defense: 0, hpMax: 0 },
        description: '以電磁力加速彈丸至 8 馬赫。無視任何護甲。',
        icon: 'weapon_railgun',
        controlType: 'MANUAL',
        siegeBehavior: 'PENETRATING_BEAM',
        orbitConfig: { radius: 70, speed: 2.5 }
    },
    {
        id: 'w_funnels_t1',
        name: '浮游砲陣列 (Funnel System)',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 1,
        rarity: 'LEGENDARY',
        behavior: 'HOMING_ORB',
        baseStats: { damage: 60, range: 800, fireRate: 300, speed: 600, critChance: 0.1, defense: 0, hpMax: 0 },
        affinity: { classes: ['WEAVER', 'ARCHITECT'], bonusStats: { fireRate: -50 } },
        description: '精神感應控制的無人攻擊單元。自動索敵。',
        icon: 'weapon_funnels',
        controlType: 'AUTO',
        siegeBehavior: 'ALL_RANGE_ATTACK',
        orbitConfig: { radius: 90, speed: 3.5 }
    },
    {
        id: 'weapon_drone_t1',
        name: '浮游單元 Beta',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 1,
        rarity: 'LEGENDARY',
        baseStats: { damage: 15, range: 500, fireRate: 150, speed: 1.0, critChance: 0.1, defense: 0, hpMax: 0 },
        description: '高科技無人攻擊載具。自動追蹤目標發射光束。',
        icon: 'weapon_drone',
        behavior: 'DRONE_BEAM',
        visualCategory: 'DRONE',
        controlType: 'AUTO',
        siegeBehavior: 'FOCUS_FIRE',
        orbitConfig: { radius: 100, speed: 2.0 }
    }
];
