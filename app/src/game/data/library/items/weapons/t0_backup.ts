import { ItemDef } from '../../../../../types';

/**
 * T0: 傳說級 Glitch 武器 (最強)
 * 概念: 超越物理法則的錯誤代碼武器
 */
export const T0_WEAPONS: ItemDef[] = [
    {
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
        // [V4] Brotato-style orbit config
        orbitConfig: { radius: 80, speed: 5.0 },
        attackConfig: { duration: 200, hitboxWidth: 120, hitboxHeight: 60, hitboxOffset: { x: 0, y: 0 } }
    },
    {
        id: 'w_glitch_storm_t0',
        name: '溢位風暴 (Overflow Storm)',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 0,
        rarity: 'GLITCH',
        behavior: 'DRONE_BEAM',
        baseStats: { damage: 50, range: 1000, fireRate: 100, speed: 0, critChance: 0.1, defense: 0, hpMax: 0 },
        description: '直接對視野內所有目標的內存地址進行寫入攻擊。',
        icon: 'weapon_glitch_orb',
        controlType: 'AUTO',
        siegeBehavior: 'AOE_DOT_FIELD',
        orbitConfig: { radius: 100, speed: 2.0 }
    }
];
