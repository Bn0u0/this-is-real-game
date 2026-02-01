import { ItemDef } from '../../../../../../types';

export const SCRAP_SHOTGUN: ItemDef = {
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
};
