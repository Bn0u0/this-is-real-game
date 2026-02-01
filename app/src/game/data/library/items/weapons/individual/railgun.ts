import { ItemDef } from '../../../../../../types';

export const RAILGUN: ItemDef = {
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
};
