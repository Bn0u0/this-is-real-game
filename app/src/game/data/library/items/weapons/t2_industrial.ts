import { ItemDef } from '../../../../../types';

/**
 * T2: 史詩級戰術武器
 * 概念: 軍事級精密武器
 */
export const T2_WEAPONS: ItemDef[] = [
    {
        id: 'w_sniper_t2',
        name: '維和者 (Peacekeeper)',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 2,
        rarity: 'EPIC',
        behavior: 'LASER',
        baseStats: { damage: 250, range: 1200, fireRate: 2000, critChance: 0.3, speed: 2000, defense: 0, hpMax: 0 },
        description: '反器材狙擊步槍。一擊必殺。',
        icon: 'weapon_sniper',
        controlType: 'MANUAL',
        siegeBehavior: 'INFINITE_RANGE_SNIPE',
        orbitConfig: { radius: 65, speed: 2.0 }
    },
    {
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
    },
    {
        id: 'w_vector_t2',
        name: '死亡風暴 (Deathstorm)',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 2,
        rarity: 'EPIC',
        behavior: 'PISTOL_SHOT',
        baseStats: { damage: 12, range: 350, fireRate: 50, critChance: 0.15, speed: 1500, defense: 0, hpMax: 0 },
        description: '射速極快的衝鋒槍，彈藥傾瀉如風暴。',
        icon: 'weapon_smg',
        controlType: 'MANUAL',
        siegeBehavior: 'RAPID_FIRE_BURST',
        orbitConfig: { radius: 55, speed: 3.0 }
    },
    // [MOVED FROM T3] 動力大錘 - 有液壓推進，屬於戰術級
    {
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
    },
    // [MOVED FROM T3] 圓鋸發射器 - 特殊機械邏輯
    {
        id: 'w_sawblade_t2',
        name: '圓鋸發射器 (Ripper)',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 2,
        rarity: 'EPIC',
        behavior: 'BOOMERANG',
        baseStats: { damage: 40, range: 400, fireRate: 800, speed: 500, critChance: 0.15, defense: 0, hpMax: 0 },
        description: '發射高速旋轉的圓鋸，會飛回使用者手中。',
        icon: 'weapon_sawblade',
        controlType: 'AUTO',
        siegeBehavior: 'SAW_HOVER',
        orbitConfig: { radius: 60, speed: 4.5 }
    },
    // [MOVED FROM T3] 制式步槍 - 軍用武器
    {
        id: 'w_assault_rifle_t2',
        name: '制式步槍 (Assault Rifle)',
        type: 'WEAPON',
        slot: 'mainWeapon',
        tier: 2,
        rarity: 'EPIC',
        behavior: 'PISTOL_SHOT',
        baseStats: { damage: 18, range: 500, fireRate: 150, speed: 1200, critChance: 0.1, defense: 0, hpMax: 0 },
        description: '舊時代的軍用標準突擊步槍。可靠且平衡。',
        icon: 'weapon_ar',
        controlType: 'HYBRID',
        siegeBehavior: 'FULL_AUTO_KITE',
        orbitConfig: { radius: 55, speed: 2.5 }
    }
];
