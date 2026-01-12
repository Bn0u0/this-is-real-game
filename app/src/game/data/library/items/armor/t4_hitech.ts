import { ItemDef } from '../../../../../types';

export const T4_ARMOR: ItemDef[] = [
    // HEAD
    {
        id: 'a_psionic_crown_t4',
        name: '靈能頭冠 (Psionic Crown)',
        type: 'ARMOR',
        slot: 'head',
        tier: 4,
        rarity: 'LEGENDARY',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 0, critChance: 0.2, defense: 8, hpMax: 50 },
        description: '增強使用者的腦波，甚至能預知危險。',
        icon: 'armor_helmet_hitech'
    },
    // BODY
    {
        id: 'a_phase_suit_t4',
        name: '相位轉移裝甲 (Phase Suit)',
        type: 'ARMOR',
        slot: 'body',
        tier: 4,
        rarity: 'LEGENDARY',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 100, critChance: 0, defense: 20, hpMax: 100 },
        description: '部分組件位於異空間，物理攻擊難以命中。',
        icon: 'armor_body_hitech'
    },
    // LEGS
    {
        id: 'a_blink_greaves_t4',
        name: '閃爍護腿 (Blink Greaves)',
        type: 'ARMOR',
        slot: 'legs',
        tier: 4,
        rarity: 'LEGENDARY',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 80, critChance: 0.05, defense: 10, hpMax: 60 },
        description: '移動時會留下殘影。',
        icon: 'armor_legs_hitech'
    },
    // FEET
    {
        id: 'a_void_walkers_t4',
        name: '虛空行者 (Void Walkers)',
        type: 'ARMOR',
        slot: 'feet',
        tier: 4,
        rarity: 'LEGENDARY',
        baseStats: { damage: 0, range: 0, fireRate: 0, speed: 100, critChance: 0.1, defense: 8, hpMax: 30 },
        description: '每一步都踏在現實的裂縫上。',
        icon: 'armor_feet_hitech'
    }
];
