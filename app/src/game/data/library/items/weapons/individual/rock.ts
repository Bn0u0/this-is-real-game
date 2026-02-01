import { ItemDef } from '../../../../../../types';

export const ROCK: ItemDef = {
    id: 'w_rock_t5',
    name: '石頭',
    type: 'WEAPON',
    slot: 'mainWeapon',
    tier: 5,
    rarity: 'COMMON',
    baseStats: { damage: 8, range: 180, fireRate: 800, speed: 350, critChance: 0.05, defense: 0, hpMax: 0 },
    description: '地上撿的石頭。人類最原始的遠程武器。',
    icon: 'weapon_rock',
    behavior: 'PISTOL_SHOT',
    visualCategory: 'OTHER',
    controlType: 'MANUAL',
    siegeBehavior: 'NONE',
    orbitConfig: { radius: 35, speed: 2.0 }
};
