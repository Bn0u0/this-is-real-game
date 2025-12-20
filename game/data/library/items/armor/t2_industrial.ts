import { ItemDef } from '../../../../../types';

export const T2_ARMOR: ItemDef[] = [
    // HEAD
    {
        id: 'a_miner_helmet_t2',
        name: '礦工頭盔 (Miner Helmet)',
        type: 'ARMOR',
        slot: 'head',
        tier: 2,
        rarity: 'RARE',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 0, critChance: 0.05, defense: 3, hpMax: 20 },
        description: '附帶探照燈的堅固頭盔。視野+1。',
        icon: 'armor_helmet_miner'
    },
    // BODY
    {
        id: 'a_kevlar_vest_t2',
        name: '凱夫拉背心 (Kevlar Vest)',
        type: 'ARMOR',
        slot: 'body',
        tier: 2,
        rarity: 'RARE',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 0, critChance: 0, defense: 8, hpMax: 50 },
        description: '舊世界的制式防彈衣。輕便且有效。',
        icon: 'armor_body_kevlar'
    },
    // LEGS
    {
        id: 'a_cargo_pants_t2',
        name: '戰術工裝褲 (Cargo Pants)',
        type: 'ARMOR',
        slot: 'legs',
        tier: 2,
        rarity: 'RARE',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 20, critChance: 0, defense: 2, hpMax: 20 },
        description: '有很多口袋，或許能多帶點子彈。',
        icon: 'armor_legs_cargo'
    },
    // FEET
    {
        id: 'a_mag_boots_t2',
        name: '磁力靴 (Mag Boots)',
        type: 'ARMOR',
        slot: 'feet',
        tier: 2,
        rarity: 'RARE',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: -20, critChance: 0, defense: 4, hpMax: 10 },
        description: '提供額外的抓地力，防擊退。',
        icon: 'armor_feet_mag'
    }
];
