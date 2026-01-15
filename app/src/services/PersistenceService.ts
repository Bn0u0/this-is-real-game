import { account, databases, DB_ID, COLLECTION_PROFILES } from './AppwriteClient';
import { ItemInstance, LicenseRank } from '../types';
import { ID, Query } from 'appwrite';

export interface UserProfile {
    username: string;
    level: number;
    toolkitLevel: number;
    xp: number;
    credits: number;
    inventory: ItemInstance[];
    loadout: any;
    hasPlayedOnce: boolean;
    stats: {
        totalKills: number;
        runsCompleted: number;
    };
    licenses: Record<string, LicenseRank>;
    blueprints: string[];
}

const DEFAULT_PROFILE: UserProfile = {
    username: 'Guest',
    level: 1,
    toolkitLevel: 1,
    xp: 0,
    credits: 0,
    inventory: [],
    loadout: {
        mainWeapon: {
            uid: 'default_weapon',
            defId: 'W_T1_PISTA_01',
            def: null,
            name: 'Pistol',
            rarity: 'COMMON',
            computedStats: { damage: 10 }
        },
        head: null,
        body: null,
        legs: null,
        feet: null
    },
    hasPlayedOnce: false,
    stats: { totalKills: 0, runsCompleted: 0 },
    licenses: {
        'SCAVENGER': 'D',
        'SKIRMISHER': 'D',
        'WEAVER': 'D'
    },
    blueprints: ['bp_scavenger', 'bp_skirmisher', 'bp_weaver']
};

const STORAGE_KEY = 'SYNAPSE_NEO_INVENTORY_V5';

class PersistenceService {
    private profile: UserProfile;
    private userId: string | null = null;

    constructor() {
        const saved = localStorage.getItem(STORAGE_KEY);
        this.profile = saved ? JSON.parse(saved) : { ...DEFAULT_PROFILE };
        this.initCloudSync();
    }

    async initCloudSync() {
        try {
            // Check if already logged in
            try {
                const user = await account.get();
                this.userId = user.$id;
                console.log("🟢 [Appwrite] Session found:", user.email || user.$id);
            } catch (e) {
                // Not logged in, try anonymous session
                console.log("☁️ [Appwrite] Signing in anonymously...");
                const session = await account.createAnonymousSession();
                this.userId = session.userId;
            }

            if (this.userId) {
                await this.syncDown();
            }
        } catch (e) {
            console.warn("Cloud Sync Failed (Offline Mode)", e);
        }
    }

    getProfile(): UserProfile {
        return this.profile;
    }

    exportSaveString(): string {
        return btoa(JSON.stringify(this.profile));
    }

    importSaveString(str: string): { success: boolean, msg: string } {
        try {
            const data = JSON.parse(atob(str));
            this.profile = { ...this.profile, ...data };
            this.save({});
            return { success: true, msg: 'Profile Imported Successfully' };
        } catch (e) {
            return { success: false, msg: 'Invalid Save String' };
        }
    }

    async save(updates: Partial<UserProfile>) {
        this.profile = { ...this.profile, ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));

        if (!this.userId) return;

        try {
            // Appwrite Schema: inventory_json, stats_json (strings)
            const payload = {
                username: this.profile.username,
                toolkitLevel: this.profile.toolkitLevel,
                credits: this.profile.credits,
                inventory_json: JSON.stringify(this.profile.inventory),
                stats_json: JSON.stringify(this.profile.stats),
                // Add other fields if collections attributes are created for them
                // For now sticking to the core mapping requested
            };

            await databases.updateDocument(
                DB_ID,
                COLLECTION_PROFILES,
                this.userId,
                payload
            );
            console.log("☁️ [Appwrite] Saved.");
        } catch (error: any) {
            if (error.code === 404) {
                // Document doesn't exist, create it
                try {
                    await databases.createDocument(
                        DB_ID,
                        COLLECTION_PROFILES,
                        this.userId,
                        {
                            username: this.profile.username,
                            toolkitLevel: this.profile.toolkitLevel,
                            credits: this.profile.credits,
                            inventory_json: JSON.stringify(this.profile.inventory),
                            stats_json: JSON.stringify(this.profile.stats)
                        }
                    );
                    console.log("☁️ [Appwrite] Profile Created.");
                } catch (createError) {
                    console.error("☁️ [Appwrite] Create Failed:", createError);
                }
            } else {
                console.error("☁️ [Appwrite] Save Failed:", error);
            }
        }
    }

    async syncDown() {
        if (!this.userId) return;

        try {
            const data: any = await databases.getDocument(
                DB_ID,
                COLLECTION_PROFILES,
                this.userId
            );

            if (data) {
                console.log("☁️ [Appwrite] Profile Synced Down");

                // Parse JSON strings back to objects
                const inventory = data.inventory_json ? JSON.parse(data.inventory_json) : [];
                const stats = data.stats_json ? JSON.parse(data.stats_json) : this.profile.stats;

                this.profile = {
                    ...this.profile,
                    username: data.username || this.profile.username,
                    toolkitLevel: data.toolkitLevel || this.profile.toolkitLevel,
                    credits: data.credits ?? this.profile.credits,
                    inventory: inventory,
                    stats: stats,
                    // Note: licenses and blueprints might need their own _json fields if they are to be persisted
                };

                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
            }
        } catch (e: any) {
            if (e.code !== 404) {
                console.warn("☁️ [Appwrite] Sync Down Failed:", e);
            }
        }
    }

    async uploadScore(score: number, wave: number, survivalTime: number) {
        if (!this.userId) return;
        if (score > 999999) return;

        try {
            // Assuming a 'leaderboard' collection exists or we just update profile stats
            // For now, let's stick to the profile update since 'leaderboard' schema wasn't fully detailed in the MD
            // but the user guide mentioned 'profiles' specifically.
            console.log(`🏆 [Appwrite] Score recorded locally: ${score}`);
            this.save({
                stats: {
                    ...this.profile.stats,
                    totalKills: (this.profile.stats.totalKills || 0) + (score > 100 ? 1 : 0), // Mock logic
                }
            });
        } catch (e) {
            console.warn("🏆 [Appwrite] Score Upload Failed", e);
        }
    }

    addInventory(item: any) {
        this.profile.inventory.push(item);
        this.save({});
        console.log("📦 [Persistence] Item Added:", item.name);
    }

    async bindEmail(email: string) {
        // Appwrite email verification/binding is different from Supabase update
        // Usually involves createVerification
        try {
            // Simplified for now: just log
            console.log("📧 [Appwrite] Binding email requested:", email);
            // return { success: true, msg: '請在 Appwrite 控制台設定驗證信發送。' };
            // Actually Appwrite needs a password for email login, or Magic Link (Create Magic URL)
            return { success: false, msg: 'Appwrite 整合中，目前僅支援匿名登入。' };
        } catch (error: any) {
            return { success: false, msg: error.message };
        }
    }

    async loginWithEmail(email: string) {
        try {
            // Appwrite Magic Link (v16: createMagicURLToken)
            await account.createMagicURLToken(ID.unique(), email, window.location.origin);
            return { success: true, msg: '神經連結密鑰已發送！請前往信箱點擊連結以同步記憶。' };
        } catch (error: any) {
            return { success: false, msg: error.message };
        }
    }

    async handleAuthCallback() {
        // Appwrite handle magic link callback is usually automatic or handled via account.updateMagicURLSession
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        const secret = urlParams.get('secret');

        if (userId && secret) {
            try {
                await account.updateMagicURLSession(userId, secret);
                console.log("🟢 [Appwrite] Magic URL Session Verified");
                await this.initCloudSync();
                return true;
            } catch (e) {
                console.error("❌ [Appwrite] Magic URL Verification Failed", e);
            }
        }

        try {
            const user = await account.get();
            if (user) {
                await this.syncDown();
                return true;
            }
        } catch (e) { }

        return false;
    }

    generateGiftCode(weapon: any): string {
        return btoa(JSON.stringify(weapon));
    }
}

export const persistence = new PersistenceService();
