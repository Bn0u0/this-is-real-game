import { ItemDef } from '../../../../../types';

export const T3_ARMOR: ItemDef[] = [
    // HEAD
    {
        id: 'a_tactical_hud_t3',
        name: '戰術 HUD 面罩 (Tactical HUD)',
        type: 'ARMOR',
        slot: 'head',
        tier: 3,
        rarity: 'EPIC',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 0, critChance: 0.1, defense: 5, hpMax: 20 },
        affinity: { classes: ['RANGER', 'GUNNER', 'SCAVENGER'], bonusStats: { critChance: 0.1 } }, // 遠程系+爆
        description: '即時顯示彈道修正與弱點分析。',
        icon: 'armor_helmet_tactical'
    },
    // BODY
    {
        id: 'a_nanofiber_suit_t3',
        name: '奈米纖維服 (Nanofiber Suit)',
        type: 'ARMOR',
        slot: 'body',
        tier: 3,
        rarity: 'EPIC',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 50, critChance: 0, defense: 10, hpMax: 40 },
        affinity: { classes: ['RONIN', 'SPECTRE'], bonusStats: { speed: 50 } }, // 敏捷系+速
        description: '輕盈但堅韌，能自動修復微小損傷。',
        icon: 'armor_body_tactical'
    },
    // LEGS
    {
        id: 'a_exo_greaves_t3',
        name: '外骨骼護腿 (Exo Legs)',
        type: 'ARMOR',
        slot: 'legs',
        tier: 3,
        rarity: 'EPIC',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 30, critChance: 0, defense: 6, hpMax: 30 },
        affinity: { classes: ['RAIDER', 'MEDIC'], bonusStats: { hpMax: 50 } }, // 重裝系+血
        description: '液壓輔助關節。奔跑更省力，踢人更痛。',
        icon: 'armor_legs_tactical'
    },
    // FEET
    {
        id: 'a_grav_boots_t3',
        name: '反重力靴 (Grav Boots)',
        type: 'ARMOR',
        slot: 'feet',
        tier: 3,
        rarity: 'EPIC',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 20, critChance: 0, defense: 4, hpMax: 10 },
        description: '能短暫懸浮。其實只是氣墊比較高級。',
        icon: 'armor_feet_tactical'
    }
];
