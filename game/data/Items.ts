export enum ItemType {
    WEAPON = 'WEAPON',
    ARMOR = 'ARMOR',
    ARTIFACT = 'ARTIFACT',
    SCRAP = 'SCRAP'
}

export enum ItemRarity {
    COMMON = 'COMMON',
    UNCOMMON = 'UNCOMMON',
    RARE = 'RARE',
    LEGENDARY = 'LEGENDARY'
}

export enum EquipmentSlot {
    HEAD = 'HEAD',
    BODY = 'BODY',
    LEGS = 'LEGS',
    FEET = 'FEET',
    MAIN_HAND = 'MAIN_HAND',
    OFF_HAND = 'OFF_HAND',
    NONE = 'NONE' // For scrap/consumables
}

export interface ItemStats {
    hp?: number;
    shield?: number;
    atk?: number;
    speed?: number; // percentage 0.1 = +10%
    cooldown?: number; // percentage reduction
    crit?: number;
}

export interface ItemDef {
    id: string; // e.g. 'wpn_vanguard_sword_mk1'
    name: string;
    type: ItemType;
    slot: EquipmentSlot;
    rarity: ItemRarity;
    classReq?: string[]; // If null, usable by all
    tier: number; // 1-10
    stats: ItemStats;
    icon: string; // CSS emoji or eventual path
}

export interface InventoryItem {
    id: string; // Unique Instance ID (UUID)
    defId: string; // ref to ItemDef
    acquiredAt: number;
    isNew?: boolean;
}

// --- THE GRAND ARSENAL (Database) ---
export const ITEM_DATABASE: Record<string, ItemDef> = {
    // === VANGUARD WEAPONS ===
    'wpn_vanguard_sword_mk1': {
        id: 'wpn_vanguard_sword_mk1', name: 'Pulse Blade Mk.I',
        type: ItemType.WEAPON, slot: EquipmentSlot.MAIN_HAND,
        rarity: ItemRarity.COMMON, tier: 1, classReq: ['Vanguard'],
        stats: { atk: 10, speed: 0.05 }, icon: '⚔️'
    },
    'wpn_vanguard_sword_mk2': {
        id: 'wpn_vanguard_sword_mk2', name: 'Thermal Katana',
        type: ItemType.WEAPON, slot: EquipmentSlot.MAIN_HAND,
        rarity: ItemRarity.UNCOMMON, tier: 2, classReq: ['Vanguard'],
        stats: { atk: 18, crit: 5 }, icon: '🔥'
    },
    'wpn_vanguard_shield_mk1': {
        id: 'wpn_vanguard_shield_mk1', name: 'Repulsor Buckler',
        type: ItemType.WEAPON, slot: EquipmentSlot.OFF_HAND,
        rarity: ItemRarity.COMMON, tier: 1, classReq: ['Vanguard'],
        stats: { shield: 20, hp: 10 }, icon: '🛡️'
    },

    // === BASTION WEAPONS ===
    'wpn_bastion_hammer_mk1': {
        id: 'wpn_bastion_hammer_mk1', name: 'Impact Hammer',
        type: ItemType.WEAPON, slot: EquipmentSlot.MAIN_HAND,
        rarity: ItemRarity.COMMON, tier: 1, classReq: ['Bastion'],
        stats: { atk: 15, speed: -0.1 }, icon: '🔨'
    },
    'wpn_bastion_wall_mk1': {
        id: 'wpn_bastion_wall_mk1', name: 'Aegis Wall',
        type: ItemType.WEAPON, slot: EquipmentSlot.OFF_HAND,
        rarity: ItemRarity.UNCOMMON, tier: 2, classReq: ['Bastion'],
        stats: { hp: 100, shield: 50 }, icon: '🧱'
    },

    // === SPECTRE WEAPONS ===
    'wpn_spectre_rifle_mk1': {
        id: 'wpn_spectre_rifle_mk1', name: 'Phase Rifle',
        type: ItemType.WEAPON, slot: EquipmentSlot.MAIN_HAND,
        rarity: ItemRarity.COMMON, tier: 1, classReq: ['Spectre'],
        stats: { atk: 25, cooldown: -0.05 }, icon: '🔫'
    },

    // === ARMOR (SHARED) ===
    'arm_head_mk1': {
        id: 'arm_head_mk1', name: 'Civilian Visor',
        type: ItemType.ARMOR, slot: EquipmentSlot.HEAD,
        rarity: ItemRarity.COMMON, tier: 1, classReq: null,
        stats: { shield: 10 }, icon: '🥽'
    },
    'arm_body_mk1': {
        id: 'arm_body_mk1', name: 'Kevlar Vest',
        type: ItemType.ARMOR, slot: EquipmentSlot.BODY,
        rarity: ItemRarity.COMMON, tier: 1, classReq: null,
        stats: { hp: 20 }, icon: '🦺'
    },
    'arm_legs_mk1': {
        id: 'arm_legs_mk1', name: 'Cargo Pants',
        type: ItemType.ARMOR, slot: EquipmentSlot.LEGS,
        rarity: ItemRarity.COMMON, tier: 1, classReq: null,
        stats: { speed: 0.02 }, icon: '👖'
    },
    'arm_feet_mk1': {
        id: 'arm_feet_mk1', name: 'Combat Boots',
        type: ItemType.ARMOR, slot: EquipmentSlot.FEET,
        rarity: ItemRarity.COMMON, tier: 1, classReq: null,
        stats: { speed: 0.05 }, icon: '👢'
    },

    // === ARTIFACTS (Loot Boxes) ===
    'art_box_mk1': {
        id: 'art_box_mk1', name: 'Encrypted Cache (Mk.I)',
        type: ItemType.ARTIFACT, slot: EquipmentSlot.NONE,
        rarity: ItemRarity.COMMON, tier: 1, classReq: null,
        stats: {}, icon: '📦'
    },

    // === SCRAP ===
    'm_scrap': {
        id: 'm_scrap', name: 'Scrap Metal',
        type: ItemType.SCRAP, slot: EquipmentSlot.NONE,
        rarity: ItemRarity.COMMON, tier: 0, classReq: null,
        stats: {}, icon: '⚙️'
    }
};

export function getItemDef(defId: string): ItemDef | null {
    return ITEM_DATABASE[defId] || null;
}
