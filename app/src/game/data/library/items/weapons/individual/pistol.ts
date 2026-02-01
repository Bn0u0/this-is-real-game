import { ItemDef } from '../../../../../../types';

export const PISTOL: ItemDef = {
    id: 'weapon_pistol_t3',
    name: '老夥計 (Pistol)',
    type: 'WEAPON',
    slot: 'mainWeapon',
    tier: 3,
    rarity: 'RARE',
    baseStats: { damage: 20, range: 450, fireRate: 500, speed: 1.0, critChance: 0.1, defense: 0, hpMax: 0 },
    description: '經過精心保養的老式手槍。可靠且精準。',
    icon: 'weapon_pistol',
    behavior: 'PISTOL_SHOT',
    visualCategory: 'PISTOL',
    controlType: 'HYBRID',
    siegeBehavior: 'MOONWALK_LASER',
    orbitConfig: { radius: 50, speed: 2.5 }
};
