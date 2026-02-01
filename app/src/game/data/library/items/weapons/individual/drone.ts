import { ItemDef } from '../../../../../../types';

export const DRONE: ItemDef = {
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
};
