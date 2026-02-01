import { ItemDef } from '../../../../../../types';

export const BROKEN_BOTTLE: ItemDef = {
    id: 'w_broken_bottle_t5',
    name: '破瓶子',
    type: 'WEAPON',
    slot: 'mainWeapon',
    tier: 5,
    rarity: 'COMMON',
    baseStats: { damage: 10, range: 35, fireRate: 350, speed: 1.0, critChance: 0.12, defense: 0, hpMax: 0 },
    description: '打碎的玻璃瓶。鋒利的邊緣能造成割傷。',
    icon: 'weapon_bottle',
    behavior: 'MELEE_THRUST',
    visualCategory: 'BLADE',
    controlType: 'MANUAL',
    siegeBehavior: 'NONE',
    orbitConfig: { radius: 35, speed: 3.0 },
    attackConfig: { duration: 100, hitboxWidth: 30, hitboxHeight: 30, hitboxOffset: { x: 10, y: 0 } }
};
