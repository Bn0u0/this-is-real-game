import { ItemDef } from '../../../../../../types';

export const SNIPER: ItemDef = {
    id: 'w_sniper_t2',
    name: '維和者 (Peacekeeper)',
    type: 'WEAPON',
    slot: 'mainWeapon',
    tier: 2,
    rarity: 'EPIC',
    behavior: 'LASER',
    baseStats: { damage: 250, range: 1200, fireRate: 2000, critChance: 0.3, speed: 2000, defense: 0, hpMax: 0 },
    description: '反器材狙擊步槍。一擊必殺。',
    icon: 'weapon_sniper',
    controlType: 'MANUAL',
    siegeBehavior: 'INFINITE_RANGE_SNIPE',
    orbitConfig: { radius: 65, speed: 2.0 }
};
