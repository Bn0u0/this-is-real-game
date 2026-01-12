import { ItemDef } from '../../../../../types';

export const T1_ARMOR: ItemDef[] = [
    // HEAD
    {
        id: 'a_scrap_helmet_t1',
        name: '焊接面罩 (Welder Mask)',
        type: 'ARMOR',
        slot: 'head',
        tier: 1,
        rarity: 'COMMON',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 0, critChance: 0, defense: 2, hpMax: 10 },
        description: '防止火花濺入眼睛，也能擋擋小石頭。',
        icon: 'armor_helmet_scrap'
    },
    // BODY
    {
        id: 'a_scrap_plate_t1',
        name: '廢鐵胸甲 (Scrap Plate)',
        type: 'ARMOR',
        slot: 'body',
        tier: 1,
        rarity: 'COMMON',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: -50, critChance: 0, defense: 5, hpMax: 30 },
        description: '用車門和鐵鍊拼湊成的護甲。有點重。',
        icon: 'armor_body_scrap'
    },
    // LEGS
    {
        id: 'a_scrap_greaves_t1',
        name: '加固護腿 (Reinforced Jeans)',
        type: 'ARMOR',
        slot: 'legs',
        tier: 1,
        rarity: 'COMMON',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 0, critChance: 0, defense: 1, hpMax: 10 },
        description: '縫了鐵片的牛仔褲。',
        icon: 'armor_legs_scrap'
    },
    // FEET
    {
        id: 'a_scrap_boots_t1',
        name: '工頭工作鞋 (Foreman Boots)',
        type: 'ARMOR',
        slot: 'feet',
        tier: 1,
        rarity: 'COMMON',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 50, critChance: 0, defense: 1, hpMax: 5 },
        description: '鞋底很厚，踩到釘子也不怕。',
        icon: 'armor_feet_scrap'
    }
];
