import { ItemDef } from '../../../../../../types';

export const NAILGUN: ItemDef = {
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
};
