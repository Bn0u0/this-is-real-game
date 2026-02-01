import { ItemDef } from '../../../../../../types';

export const FUNNELS: ItemDef = {
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
};
