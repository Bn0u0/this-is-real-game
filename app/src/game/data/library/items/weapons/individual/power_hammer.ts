import { ItemDef } from '../../../../../../types';

export const POWER_HAMMER: ItemDef = {
    id: 'w_sledgehammer_t2',
    name: '動力大錘 (Power Hammer)',
    type: 'WEAPON',
    slot: 'mainWeapon',
    tier: 2,
    rarity: 'EPIC',
    behavior: 'SHOCKWAVE',
    baseStats: { damage: 80, range: 150, fireRate: 1500, speed: 1.0, critChance: 0.05, defense: 0, hpMax: 0 },
    description: '裝有液壓推進裝置的大錘。能引發地面震波。',
    icon: 'weapon_hammer',
    controlType: 'MANUAL',
    siegeBehavior: 'EARTHSHATTER',
    orbitConfig: { radius: 65, speed: 2.0 },
    attackConfig: { duration: 300, hitboxWidth: 100, hitboxHeight: 100, hitboxOffset: { x: 0, y: 0 } }
};
