import { ItemDef } from '../../../../../../types';

export const PIPE_WRENCH: ItemDef = {
    id: 'w_pipe_wrench_t4',
    name: '重型管鉗 (Pipe Wrench)',
    type: 'WEAPON',
    slot: 'mainWeapon',
    tier: 4,
    rarity: 'COMMON',
    behavior: 'MELEE_SWEEP',
    baseStats: { damage: 35, range: 80, fireRate: 900, speed: 1.0, critChance: 0.05, defense: 0, hpMax: 0 },
    description: '修水管的工具，或者修理不聽話的拾荒者。',
    icon: 'weapon_wrench',
    controlType: 'HYBRID',
    siegeBehavior: 'SLOW_CHARGE',
    orbitConfig: { radius: 55, speed: 3.0 },
    attackConfig: { duration: 200, hitboxWidth: 60, hitboxHeight: 30, hitboxOffset: { x: 0, y: 0 } }
};
