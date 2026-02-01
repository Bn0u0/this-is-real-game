import { ItemDef } from '../../../../../../types';

export const REALITY_SLICER: ItemDef = {
    id: 'w_reality_slicer_t0',
    name: '現實切割者 (Reality Slicer)',
    type: 'WEAPON',
    slot: 'mainWeapon',
    tier: 0,
    rarity: 'GLITCH',
    behavior: 'MELEE_SWEEP',
    baseStats: { damage: 999, range: 300, fireRate: 1000, speed: 1.0, critChance: 1.0, defense: 0, hpMax: 0 },
    description: 'ERROR: WEAPON_DATA_CORRUPTED. 切割空間本身的錯誤代碼。',
    icon: 'weapon_glitch_sword',
    controlType: 'MANUAL',
    siegeBehavior: 'TIME_STOP_SLASH',
    orbitConfig: { radius: 80, speed: 5.0 },
    attackConfig: { duration: 200, hitboxWidth: 120, hitboxHeight: 60, hitboxOffset: { x: 0, y: 0 } }
};
