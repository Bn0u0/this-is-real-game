import { ItemDef } from '../../../../types';
import * as WEAPONS from './weapons/individual';
import { ARMOR_COLLECTION } from './armor';

// 1. Aggregate all weapons
const ALL_WEAPONS: ItemDef[] = [
    // T0: Glitch
    WEAPONS.REALITY_SLICER,
    WEAPONS.GLITCH_STORM,
    // T1: Hi-Tech
    WEAPONS.RAILGUN,
    WEAPONS.FUNNELS,
    WEAPONS.DRONE,
    // T2: Tactical
    WEAPONS.SNIPER,
    WEAPONS.KATANA,
    WEAPONS.SMG,
    WEAPONS.POWER_HAMMER,
    WEAPONS.RIPPER,
    WEAPONS.ASSAULT_RIFLE,
    // T3: Industrial
    WEAPONS.PISTOL,
    WEAPONS.NAILGUN,
    // T4: Scrap
    WEAPONS.CROWBAR,
    WEAPONS.PIPE_WRENCH,
    WEAPONS.SCRAP_SHOTGUN,
    // T5: Primitive
    WEAPONS.FIST,
    WEAPONS.BROKEN_BOTTLE,
    WEAPONS.ROCK
];

const ALL_ITEMS: ItemDef[] = [
    ...ALL_WEAPONS,
    ...ARMOR_COLLECTION
];

// 2. Registry Map
export const ITEM_REGISTRY: Record<string, ItemDef> = ALL_ITEMS.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
}, {} as Record<string, ItemDef>);

// 3. API
export const ItemLibrary = {
    get: (id: string) => ITEM_REGISTRY[id],

    getByTier: (tier: number) => ALL_ITEMS.filter(i => i.tier === tier),

    getRandomDef: (tier: number) => {
        const pool = ALL_ITEMS.filter(i => i.tier === tier);
        if (pool.length > 0) {
            return pool[Math.floor(Math.random() * pool.length)];
        }
        // Fallback to first weapon to prevent crash
        console.warn(`[ItemLibrary] No items found for Tier ${tier}. Falling back to default.`);
        return ALL_WEAPONS[0] || null;
    }
};
