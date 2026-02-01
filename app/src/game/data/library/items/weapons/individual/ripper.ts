import { ItemDef } from '../../../../../../types';

export const RIPPER: ItemDef = {
    id: 'w_sawblade_t2',
    name: '圓鋸發射器 (Ripper)',
    type: 'WEAPON',
    slot: 'mainWeapon',
    tier: 2,
    rarity: 'EPIC',
    behavior: 'BOOMERANG',
    baseStats: { damage: 40, range: 400, fireRate: 800, speed: 500, critChance: 0.15, defense: 0, hpMax: 0 },
    description: '發射高速旋轉的圓鋸，會飛回使用者手中。',
    icon: 'weapon_sawblade',
    controlType: 'AUTO',
    siegeBehavior: 'SAW_HOVER',
    orbitConfig: { radius: 60, speed: 4.5 }
};
