import { ItemDef } from '../../../../../types';

export const T5_ARMOR: ItemDef[] = [
    // HEAD
    {
        id: 'a_crown_of_errors_t5',
        name: '錯誤之冠 (Crown of Errors)',
        type: 'ARMOR',
        slot: 'head',
        tier: 5,
        rarity: 'GLITCH',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 0, critChance: 0.5, defense: 0, hpMax: -50 },
        description: '戴上它，你的存在本身就是個 Bug。極高的爆擊，但生命不穩定。',
        icon: 'armor_helmet_glitch'
    },
    // BODY
    {
        id: 'a_god_mode_vest_t5',
        name: '開發者背心 (Dev Vest)',
        type: 'ARMOR',
        slot: 'body',
        tier: 5,
        rarity: 'GLITCH',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 0, critChance: 0, defense: 999, hpMax: 999 },
        affinity: { classes: ['ARCHITECT'], exclusive: true }, // 只有架構師能穿
        description: '權限等級：ADMIN。',
        icon: 'armor_body_glitch'
    },
    // LEGS
    {
        id: 'a_missing_no_t5',
        name: 'MissingNo. Pants',
        type: 'ARMOR',
        slot: 'legs',
        tier: 5,
        rarity: 'GLITCH',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 500, critChance: 0, defense: 50, hpMax: 100 },
        // removed dodge multiplier as it is not in ItemStats
        description: '貼圖丟失的褲子。',
        icon: 'armor_legs_glitch'
    },
    // FEET
    {
        id: 'a_noclip_boots_t5',
        name: '穿牆靴 (Noclip Boots)',
        type: 'ARMOR',
        slot: 'feet',
        tier: 5,
        rarity: 'GLITCH',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 999, critChance: 0, defense: 10, hpMax: 10 },
        description: '允許穿過任何物理碰撞體 (理論上)。',
        icon: 'armor_feet_glitch'
    }
];
