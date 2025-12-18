// PersistenceService.ts - Zero-Backend Protocol
import LZString from 'lz-string';

export interface UserProfile {
    level: number;
    xp: number;
    credits: number;
    inventory: string[]; // List of Item IDs
    loadout: {
        weapon: string; // 'Vanguard' etc
        artifact: string;
    };
    unlocks: string[];
    hasPlayedOnce: boolean;
    lockedClass: string | null; // V4.0: One Life, One Class
}

const STORAGE_KEY = 'SYNAPSE_PROFILE_V2';

export class PersistenceService {
    private data: UserProfile;

    constructor() {
        this.data = this.load();
    }

    public load(): UserProfile {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const loaded = JSON.parse(raw);
                return { ...this.defaultProfile(), ...loaded };
            }
        } catch (e) {
            console.error('Failed to load profile', e);
        }
        return this.defaultProfile();
    }

    private defaultProfile(): UserProfile {
        return {
            level: 1,
            xp: 0,
            credits: 0,
            inventory: [],
            loadout: {
                weapon: 'Vanguard', // Default Class: Blade
                artifact: 'None'
            },
            unlocks: ['Vanguard'],
            hasPlayedOnce: false,
            lockedClass: null
        };
    }

    public save(newData: Partial<UserProfile>) {
        this.data = { ...this.data, ...newData };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }

    public getProfile(): UserProfile {
        return this.data;
    }

    // --- ZERO-BACKEND PROTOCOL ---

    public exportSaveString(): string {
        const json = JSON.stringify(this.data);
        const checksum = this.generateChecksum(json);
        const packet = `${checksum}|${json}`;
        return LZString.compressToBase64(packet);
    }

    public importSaveString(encoded: string): { success: boolean, msg: string } {
        try {
            const decoded = LZString.decompressFromBase64(encoded);
            if (!decoded) return { success: false, msg: 'INVALID CODE: Decompression Failed' };

            const [hash, json] = decoded.split('|');
            if (!hash || !json) return { success: false, msg: 'INVALID CODE: Format Error' };

            const calculatedHash = this.generateChecksum(json);
            if (hash !== calculatedHash) return { success: false, msg: 'INVALID CODE: Checksum Mismatch (Corruputed Asset)' };

            const loaded = JSON.parse(json);
            // Deep Merge to ensure schema safety match
            const merged = { ...this.defaultProfile(), ...loaded };

            // Validate critical fields
            if (typeof merged.level !== 'number' || !Array.isArray(merged.inventory)) {
                return { success: false, msg: 'INVALID CODE: Schema Mismatch' };
            }

            this.data = merged;
            this.save({}); // Commit to LocalStorage
            return { success: true, msg: 'DIGITAL ASSET RESTORED' };

        } catch (e) {
            console.error(e);
            return { success: false, msg: 'CRITICAL ERROR' };
        }
    }

    private generateChecksum(str: string): string {
        let hash = 0, i, chr;
        if (str.length === 0) return hash.toString(16);
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString(16);
    }

    // --- GAMEPLAY HOOKS ---

    public addXp(amount: number) {
        this.data.xp += amount;
        const nextLevel = this.data.level * 100;
        if (this.data.xp >= nextLevel) {
            this.data.level++;
            this.data.xp -= nextLevel;
        }
        this.save({});
    }

    public addCredits(amount: number) {
        this.data.credits += amount;
        this.save({});
    }
}

export const persistence = new PersistenceService();
