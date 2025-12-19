import { ItemDef } from '../../../../types';
import { T0_WEAPONS } from './weapons/t0_backup';
import { T1_WEAPONS } from './weapons/t1_scrap';
import { T2_WEAPONS } from './weapons/t2_industrial';
import { T3_WEAPONS } from './weapons/t3_tactical';
// import { T4_WEAPONS } from './weapons/t4_hitech';
import { T5_WEAPONS } from './weapons/t5_glitch';

// 1. Aggregate
const ALL_ITEMS: ItemDef[] = [
    ...T0_WEAPONS,
    ...T1_WEAPONS,
    ...T2_WEAPONS, // Currently empty placeholder
    ...T3_WEAPONS,
    // ...T4_WEAPONS,
    ...T5_WEAPONS,
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
        return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
    }
};
