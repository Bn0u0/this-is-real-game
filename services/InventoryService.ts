import { InventoryItem, ItemType, ITEM_DATABASE, getItemDef, EquipmentSlot, ItemStats, ItemRarity } from '../game/data/Items';

// Simple UUID generator
function genId() { return Math.random().toString(36).substr(2, 9); }

export interface InventoryState {
    credits: number;
    stash: InventoryItem[]; // Un-equipped items
    // Loadouts: HeroClass -> { Slot: Item }
    loadouts: Record<string, Record<string, InventoryItem | null>>;
}

const STORAGE_KEY_V2 = 'SYNAPSE_INVENTORY_V3_FULL';

class InventoryService {
    private state: InventoryState;
    private listeners: ((state: InventoryState) => void)[] = [];

    constructor() {
        this.state = this.load();
    }

    private load(): InventoryState {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_V2);
            if (raw) return JSON.parse(raw);
        } catch (e) { console.error(e); }

        // Default / Wipe
        const initial = {
            credits: 100,
            stash: [] as InventoryItem[],
            loadouts: {
                'Vanguard': this.createEmptyLoadout(),
                'Bastion': this.createEmptyLoadout(),
                'Spectre': this.createEmptyLoadout(),
                'Weaver': this.createEmptyLoadout(),
                'Catalyst': this.createEmptyLoadout(),
            }
        };

        // Starter Kit
        initial.stash.push(this.createItem('wpn_vanguard_sword_mk1'));
        initial.stash.push(this.createItem('arm_body_mk1'));

        return initial;
    }

    private createEmptyLoadout() {
        return {
            [EquipmentSlot.HEAD]: null,
            [EquipmentSlot.BODY]: null,
            [EquipmentSlot.LEGS]: null,
            [EquipmentSlot.FEET]: null,
            [EquipmentSlot.MAIN_HAND]: null,
            [EquipmentSlot.OFF_HAND]: null,
        };
    }

    public createItem(defId: string): InventoryItem {
        return {
            id: genId(),
            defId: defId,
            acquiredAt: Date.now(),
            isNew: true
        };
    }

    public getState() { return this.state; }

    // --- Actions ---

    public addItemToStash(defId: string) {
        this.state.stash.push(this.createItem(defId));
        this.save();
    }

    public equipItem(heroClass: string, item: InventoryItem, slot: EquipmentSlot) {
        const def = getItemDef(item.defId);
        if (!def) return false;

        // Class Check
        if (def.classReq && !def.classReq.includes(heroClass)) {
            return false;
        }

        // Slot Check
        if (def.slot !== slot) return false;

        // Remove from Stash
        this.state.stash = this.state.stash.filter(i => i.id !== item.id);

        // Unequip current if any
        const loadout = this.state.loadouts[heroClass] || this.createEmptyLoadout();
        const current = loadout[slot];
        if (current) {
            this.state.stash.push(current);
        }

        // Equip new
        loadout[slot] = item;
        this.state.loadouts[heroClass] = loadout;

        this.save();
        return true;
    }

    public unequipItem(heroClass: string, slot: EquipmentSlot) {
        const loadout = this.state.loadouts[heroClass];
        if (!loadout) return;

        const item = loadout[slot];
        if (item) {
            this.state.stash.push(item);
            loadout[slot] = null;
            this.save();
        }
    }

    public getHeroStats(heroClass: string): ItemStats {
        const loadout = this.state.loadouts[heroClass];
        if (!loadout) return {};

        const total: ItemStats = { hp: 0, shield: 0, atk: 0, speed: 0, cooldown: 0, crit: 0 };

        Object.values(loadout).forEach(item => {
            if (!item) return;
            const def = getItemDef(item.defId);
            if (!def) return;

            if (def.stats.hp) total.hp = (total.hp || 0) + def.stats.hp;
            if (def.stats.shield) total.shield = (total.shield || 0) + def.stats.shield;
            if (def.stats.atk) total.atk = (total.atk || 0) + def.stats.atk;
            if (def.stats.speed) total.speed = (total.speed || 0) + def.stats.speed;
            if (def.stats.cooldown) total.cooldown = (total.cooldown || 0) + def.stats.cooldown;
            if (def.stats.crit) total.crit = (total.crit || 0) + def.stats.crit;
        });
        return total;
    }

    public generateGiftLink(item: InventoryItem): string {
        this.state.stash = this.state.stash.filter(i => i.id !== item.id);
        this.save();

        // Mock Link
        return `https://synapse.game/gift/${item.defId}/${genId()}`;
    }

    public decryptArtifact(itemId: string) {
        const idx = this.state.stash.findIndex(i => i.id === itemId);
        if (idx === -1) return null;

        this.state.stash.splice(idx, 1);

        // Roll for reward (Simulate 30% Asymmetric)
        const chance = Math.random();
        let newDefId = 'wpn_vanguard_sword_mk2';

        if (chance < 0.3) {
            // Off-class drop (e.g. Bastion Hammer)
            newDefId = 'wpn_bastion_hammer_mk1';
        }

        const newItem = this.createItem(newDefId);
        this.state.stash.push(newItem);
        this.save();
        return newItem;
    }

    public sellItem(itemId: string) {
        const idx = this.state.stash.findIndex(i => i.id === itemId);
        if (idx === -1) return;

        const item = this.state.stash[idx];
        const def = getItemDef(item.defId);
        let val = 10;
        if (def && def.rarity === ItemRarity.UNCOMMON) val = 50;

        this.state.stash.splice(idx, 1);
        this.state.credits += val;
        this.save();
    }

    // --- Events ---

    private save() {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(this.state));
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
