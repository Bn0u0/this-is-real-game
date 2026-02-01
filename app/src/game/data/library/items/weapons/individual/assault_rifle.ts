import { ItemDef } from '../../../../../../types';

export const ASSAULT_RIFLE: ItemDef = {
    id: 'w_assault_rifle_t2',
    name: '制式步槍 (Assault Rifle)',
    type: 'WEAPON',
    slot: 'mainWeapon',
    tier: 2,
    rarity: 'EPIC',
    behavior: 'PISTOL_SHOT',
    baseStats: { damage: 18, range: 500, fireRate: 150, speed: 1200, critChance: 0.1, defense: 0, hpMax: 0 },
    description: '舊時代的軍用標準突擊步槍。可靠且平衡。',
    icon: 'weapon_ar',
    controlType: 'HYBRID',
    siegeBehavior: 'FULL_AUTO_KITE',
    orbitConfig: { radius: 55, speed: 2.5 }
};
