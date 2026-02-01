import { ItemDef } from '../../../../../types';

/**
 * T4: 普通級廢料武器
 * 概念: 簡單手工組裝的廢料武器
 */
export const T4_WEAPONS: ItemDef[] = [
    {
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
    },
    {
        id: 'w_scrap_shotgun_t4',
        name: '土製噴子 (Scrap Shotgun)',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 4,
        rarity: 'COMMON',
        behavior: 'PISTOL_SHOT',
        baseStats: { damage: 6, range: 200, fireRate: 1200, speed: 600, critChance: 0.05, defense: 0, hpMax: 0 },
        description: '一次發射一堆廢鐵片。近距離致命。',
        icon: 'weapon_scrap_shotgun',
        controlType: 'AUTO',
        siegeBehavior: 'TIGHT_SPREAD',
        orbitConfig: { radius: 50, speed: 2.5 },
        projectileConfig: { speed: 600, lifetime: 400, textureId: 1, count: 5, spread: 0.4 }
    },
    {
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
    }
];
