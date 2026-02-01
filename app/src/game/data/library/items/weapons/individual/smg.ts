import { ItemDef } from '../../../../../../types';

export const SMG: ItemDef = {
    id: 'w_vector_t2',
    name: '死亡風暴 (Deathstorm)',
    type: 'WEAPON',
    slot: 'mainWeapon',
    tier: 2,
    rarity: 'EPIC',
    behavior: 'PISTOL_SHOT',
    baseStats: { damage: 12, range: 350, fireRate: 50, critChance: 0.15, speed: 1500, defense: 0, hpMax: 0 },
    description: '射速極快的衝鋒槍，彈藥傾瀉如風暴。',
    icon: 'weapon_smg',
    controlType: 'MANUAL',
    siegeBehavior: 'RAPID_FIRE_BURST',
    orbitConfig: { radius: 55, speed: 3.0 }
};
