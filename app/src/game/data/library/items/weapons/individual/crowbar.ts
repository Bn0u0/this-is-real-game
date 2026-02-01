import { ItemDef } from '../../../../../../types';

export const CROWBAR: ItemDef = {
    id: 'weapon_crowbar_t4',
    name: '生鏽撬棍',
    type: 'WEAPON',
    slot: 'mainWeapon',
    tier: 4,
    rarity: 'COMMON',
    baseStats: { damage: 30, range: 70, fireRate: 700, speed: 1.0, critChance: 0.08, defense: 0, hpMax: 0 },
    description: '廢墟中常見的工具。堪用的近戰武器。',
    icon: 'weapon_crowbar',
    hitbox: { shape: 'CIRCLE', offset: 45, width: 65, duration: 160 },
    behavior: 'MELEE_SWEEP',
    visualCategory: 'BLUNT',
    controlType: 'HYBRID',
    siegeBehavior: 'SLOW_CHARGE',
    orbitConfig: { radius: 55, speed: 3.0 },
    attackConfig: { duration: 180, hitboxWidth: 65, hitboxHeight: 30, hitboxOffset: { x: 0, y: 0 } }
};
