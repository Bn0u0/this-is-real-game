import { ItemDef } from '../../../../../../types';

export const KATANA: ItemDef = {
    id: 'w_katana_t2',
    name: '熱能太刀 (Thermal Katana)',
    type: 'WEAPON',
    slot: 'mainWeapon',
    tier: 2,
    rarity: 'EPIC',
    behavior: 'MELEE_SWEEP',
    baseStats: { damage: 120, range: 120, fireRate: 400, critChance: 0.25, defense: 0, hpMax: 0, speed: 1.0 },
    affinity: { classes: ['RONIN'], bonusStats: { damage: 60 } },
    description: '刀鋒加熱至 3000 度的單分子刀。切開金屬如切奶油。',
    icon: 'weapon_katana',
    controlType: 'MANUAL',
    siegeBehavior: 'IAI_DASH_SLASH',
    orbitConfig: { radius: 70, speed: 4.0 },
    attackConfig: { duration: 150, hitboxWidth: 100, hitboxHeight: 40, hitboxOffset: { x: 0, y: 0 } }
};
