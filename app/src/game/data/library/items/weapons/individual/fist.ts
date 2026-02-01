import { ItemDef } from '../../../../../../types';

export const FIST: ItemDef = {
    id: 'w_fist_t5',
    name: '拳頭',
    type: 'WEAPON',
    slot: 'mainWeapon',
    tier: 5,
    rarity: 'COMMON',
    baseStats: { damage: 8, range: 35, fireRate: 350, speed: 1.0, critChance: 0.05, defense: 0, hpMax: 0 },
    description: '你的雙手。雖然原始但可靠。近距離肉搏的最後手段。',
    icon: 'weapon_fist',
    behavior: 'MELEE_THRUST',
    visualCategory: 'BLUNT',
    controlType: 'MANUAL',
    siegeBehavior: 'NONE',
    orbitConfig: { radius: 25, speed: 0 },
    attackConfig: { duration: 120, hitboxWidth: 35, hitboxHeight: 35, hitboxOffset: { x: 15, y: 0 } }
};
