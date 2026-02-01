import { ItemDef } from '../../../../../../types';

export const GLITCH_STORM: ItemDef = {
    id: 'w_glitch_storm_t0',
    name: '溢位風暴 (Overflow Storm)',
    type: 'WEAPON',
    slot: 'mainWeapon',
    tier: 0,
    rarity: 'GLITCH',
    behavior: 'DRONE_BEAM',
    baseStats: { damage: 50, range: 1000, fireRate: 100, speed: 0, critChance: 0.1, defense: 0, hpMax: 0 },
    description: '直接對視野內所有目標的內存地址進行寫入攻擊。',
    icon: 'weapon_glitch_orb',
    controlType: 'AUTO',
    siegeBehavior: 'AOE_DOT_FIELD',
    orbitConfig: { radius: 100, speed: 2.0 }
};
