import { Utils } from 'phaser';
import { ItemInstance, ItemDef, ItemRarity, ItemStats } from '../types';
import { ItemLibrary } from '../game/data/library/items';

// Local Extension for Inventory Logic
export type InventoryItem = ItemInstance & {
    acquiredAt: number;
    isNew?: boolean;
};

// Define Slots for the Modular System
export enum ModuleSlot {
    CORE = 'CORE',
    DRIVE_1 = 'DRIVE_1',
    DRIVE_2 = 'DRIVE_2',
    PROTOCOL_1 = 'PROTOCOL_1',
    PROTOCOL_2 = 'PROTOCOL_2'
}

export interface InventoryState {
    credits: number;
    stash: InventoryItem[];
    // Single Loadout for "The Unit"
    loadout: Record<ModuleSlot, InventoryItem | null>;
}

const STORAGE_KEY_V3 = 'SYNAPSE_NEO_INVENTORY_V1';

class InventoryService {
    private state: InventoryState;
    private listeners: ((state: InventoryState) => void)[] = [];

    constructor() {
        this.state = this.load();
    }

    private load(): InventoryState {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_V3);
            if (raw) return JSON.parse(raw);
        } catch (e) { console.error(e); }

        // Default / Wipe
        const initial: InventoryState = {
            credits: 100,
            stash: [],
            loadout: {
                [ModuleSlot.CORE]: null,
                [ModuleSlot.DRIVE_1]: null,
                [ModuleSlot.DRIVE_2]: null,
                [ModuleSlot.PROTOCOL_1]: null,
                [ModuleSlot.PROTOCOL_2]: null
            }
        };

        // Starter Kit (Using T0 definitions for now)
        initial.stash.push(this.createItem('weapon_crowbar_t0'));
        initial.stash.push(this.createItem('weapon_pistol_t0'));

        return initial;
    }

    // --- Helpers ---

    private createItem(defId: string): InventoryItem {
        const def = ItemLibrary.get(defId);
        if (!def) {
            // Fallback for missing defs
            return {
                uid: Utils.String.UUID(),
                defId: defId,
                displayName: 'Unknown Artifact',
                name: 'Unknown',
                rarity: ItemRarity.COMMON,
                computedStats: { damage: 0, range: 0, fireRate: 0, critChance: 0, speed: 0 },
                acquiredAt: Date.now(),
                isNew: true
            };
        }

        return {
            uid: Utils.String.UUID(),
            defId: defId,
            displayName: def.name,
            name: def.name,
            rarity: (def.rarity as ItemRarity) || ItemRarity.COMMON,
            computedStats: {
                damage: def.baseStats.damage,
                range: def.baseStats.range,
                fireRate: def.baseStats.fireRate,
                critChance: def.baseStats.critChance || 0,
                speed: def.baseStats.speed || 0
            },
            acquiredAt: Date.now(),
            isNew: true
        };
    }

    public getState() { return this.state; }

    // --- V4.0 VIRAL ECONOMY ---

    public getSellPrice(item: InventoryItem): number {
        const def = ItemLibrary.get(item.defId);
        if (!def) return 0;
        if (def.type === 'MATERIAL') return 10;

        // Lowball Logic
        // Compat: def.rarity might be string, cast or compare
        const rarity = def.rarity as ItemRarity || ItemRarity.COMMON;

        switch (rarity) {
            case ItemRarity.COMMON: return 10;
            case ItemRarity.RARE: return 25;
            case ItemRarity.EPIC: return 50;
            case ItemRarity.LEGENDARY: return 100;
            case ItemRarity.GLITCH: return 666;
            case ItemRarity.MYTHIC: return 500;
        }
        return 1;
    }

    public generateGiftLink(item: InventoryItem): string {
        this.state.stash = this.state.stash.filter(i => i.uid !== item.uid);
        this.save();
        const code = Math.random().toString(36).substr(2, 6).toUpperCase();
        return `https://synapse.game/gift/${code}?item=${item.defId}`;
    }

    public sellItem(itemId: string) {
        const idx = this.state.stash.findIndex(i => i.uid === itemId);
        if (idx === -1) return;

        const item = this.state.stash[idx];
        const val = this.getSellPrice(item);

        this.state.stash.splice(idx, 1);
        this.addCredits(val);
        this.save();
    }

    // --- Actions ---

    public addItemToStash(defId: string) {
        if (!ItemLibrary.get(defId)) {
            console.warn(`Attempted to add invalid item: ${defId}`);
            return;
        }
        this.state.stash.push(this.createItem(defId));
        this.save();
    }

    public equipItem(item: InventoryItem, slot: ModuleSlot): boolean {
        const def = ItemLibrary.get(item.defId);
        if (!def) return false;

        // Validation: Slot Compatibility (Simplified for Archive Phase)
        // TODO: Map ItemType to ModuleSlot properly
        // let valid = false;
        // if (def.type === 'CORE' && slot === ModuleSlot.CORE) valid = true;
        //For now, allow anything anywhere for testing if type matches roughly or override

        // Remove from Stash
        this.state.stash = this.state.stash.filter(i => i.uid !== item.uid);

        // Unequip current
        const current = this.state.loadout[slot];
        if (current) this.state.stash.push(current);

        // Equip
        this.state.loadout[slot] = item;
        this.save();
        return true;
    }

    public unequipItem(slot: ModuleSlot) {
        const item = this.state.loadout[slot];
        if (item) {
            this.state.stash.push(item);
            this.state.loadout[slot] = null;
            this.save();
        }
    }

    public processLootBag(lootDefIds: string[]) {
        lootDefIds.forEach(id => this.addItemToStash(id));
    }

    public processExtractionLoot(lootDefIds: string[]) {
        this.processLootBag(lootDefIds);
    }

    public punishDeath(classId: string): string | null {
        if (this.state.stash.length > 0) {
            const idx = Math.floor(Math.random() * this.state.stash.length);
            const item = this.state.stash[idx];
            const name = item.displayName || "Unknown Item";
            this.state.stash.splice(idx, 1);
            this.save();
            return name;
        }
        return null;
    }

    // --- Stats Calculation ---

    public getPlayerStats(): ItemStats {
        const total: ItemStats = { hp: 0, shield: 0, atk: 0, speed: 0, cdr: 0, crit: 0, luck: 0 };

        Object.values(this.state.loadout).forEach(item => {
            if (!item) return;
            const def = ItemLibrary.get(item.defId);
            if (!def) return;

            // Map BaseStats to ItemStats (this is a rough mapping as ItemDef switched to baseStats)
            if (item.computedStats.damage) total.atk = (total.atk || 0) + item.computedStats.damage;
            if (item.computedStats.speed) total.speed = (total.speed || 0) + item.computedStats.speed; // This is projectile speed, not move speed...
            // Move speed not in baseStats?
            // Symbiosis bonusStats might have it.
        });
        return total;
    }

    public addCredits(amount: number) {
        this.state.credits += Math.floor(amount);
        this.save();
    }

    private save() {
        localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(this.state));
        this.notify();
    }

    public subscribe(cb: (s: InventoryState) => void) {
        this.listeners.push(cb);
        return () => { this.listeners = this.listeners.filter(l => l !== cb); };
    }

    private notify() {
        this.listeners.forEach(cb => cb(this.state));
    }
}

export const inventoryService = new InventoryService();
