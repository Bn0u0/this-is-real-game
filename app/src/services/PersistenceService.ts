import { account, databases, DB_ID, COLLECTION_PROFILES } from './AppwriteClient';
import { ItemInstance, LicenseRank, PlayerProfile } from '../types';
import { ID, Query } from 'appwrite';
import { logger } from './LoggerService';

const STORAGE_KEY = 'SYNAPSE_NEO_INVENTORY_V5';

class PersistenceService {
    private userId: string | null = null;
    private isOffline: boolean = false;
    private connectionCheck: Promise<boolean> | null = null;
    private onSyncCallback: ((data: Partial<PlayerProfile>) => void) | null = null;

    constructor() {
        // Initialization is now managed via InventoryService to ensure SSOT
    }

    public setOnSync(cb: (data: Partial<PlayerProfile>) => void) {
        this.onSyncCallback = cb;
    }

    private async ensureConnection(): Promise<boolean> {
        if (this.isOffline) return false;
        if (this.connectionCheck) return this.connectionCheck;

        // All errors are handled internally; this promise never rejects.
        this.connectionCheck = (async () => {
            try {
                const user = await account.get();
                this.userId = user.$id;
                logger.info("Appwrite", `Connected. Session found: ${user.$id}`);
                return true;
            } catch (e: any) {
                if (e.code === 401) {
                    // No session, try anonymous login
                    try {
                        logger.info("Appwrite", "No session found. Signing in anonymously...");
                        const session = await account.createAnonymousSession();
                        this.userId = session.userId;
                        logger.info("Appwrite", `Anonymous Session Created: ${this.userId}`);
                        return true;
                    } catch (sessionErr: any) {
                        this.isOffline = true;
                        logger.warn("Persistence", "Cloud Sync Unavailable (Offline Mode)", sessionErr.message || '無法建立匿名會話');
                        logger.warn("Persistence", "💡 Tip: Check Appwrite container port if testing locally.");
                        return false;
                    }
                } else {
                    // Network error (e.g., ERR_CONNECTION_REFUSED)
                    this.isOffline = true;
                    logger.warn("Persistence", "Cloud Sync Unavailable (Offline Mode)", e.message || '無法連接到 Appwrite 伺服器');
                    logger.warn("Persistence", "💡 Tip: Check Appwrite container port if testing locally.");
                    return false;
                }
            }
        })();

        return this.connectionCheck;
    }

    async initCloudSync() {
        const connected = await this.ensureConnection();
        if (connected && this.userId) {
            await this.syncDown();
        }
    }

    async save(profile: PlayerProfile) {
        if (!this.userId) return;

        try {
            const payload = {
                username: profile.username || 'Guest',
                toolkitLevel: profile.toolkitLevel || 1,
                credits: profile.credits || 0,
                inventory_json: JSON.stringify(profile.stash || []),
                stats_json: JSON.stringify(profile.stats || {}),
                loadout_json: JSON.stringify(profile.loadout || {}),
                licenses_json: JSON.stringify(profile.licenses || {}),
                blueprints_json: JSON.stringify(profile.blueprints || []),
            };

            await databases.updateDocument(
                DB_ID,
                COLLECTION_PROFILES,
                this.userId,
                payload
            );
            logger.debug("Appwrite", "Cloud Saved.");
        } catch (error: any) {
            if (error.code === 404) {
                // Document doesn't exist, create it
                try {
                    await databases.createDocument(
                        DB_ID,
                        COLLECTION_PROFILES,
                        this.userId,
                        {
                            username: profile.username || 'Guest',
                            toolkitLevel: profile.toolkitLevel || 1,
                            credits: profile.credits || 0,
                            inventory_json: JSON.stringify(profile.stash || []),
                            stats_json: JSON.stringify(profile.stats || {}),
                            loadout_json: JSON.stringify(profile.loadout || {}),
                            licenses_json: JSON.stringify(profile.licenses || {}),
                            blueprints_json: JSON.stringify(profile.blueprints || []),
                        }
                    );
                    logger.info("Appwrite", "Cloud Profile Created.");
                } catch (createError) {
                    logger.error("Appwrite", "Create Failed:", createError);
                }
            } else {
                logger.error("Appwrite", "Save Failed:", error);
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

            if (data && this.onSyncCallback) {
                logger.debug("Appwrite", "Profile Synced Down");

                // Parse JSON strings back to objects
                const stash = data.inventory_json ? JSON.parse(data.inventory_json) : [];
                const stats = data.stats_json ? JSON.parse(data.stats_json) : {};
                const loadout = data.loadout_json ? JSON.parse(data.loadout_json) : null;
                const licenses = data.licenses_json ? JSON.parse(data.licenses_json) : null;
                const blueprints = data.blueprints_json ? JSON.parse(data.blueprints_json) : null;

                this.onSyncCallback({
                    username: data.username,
                    toolkitLevel: data.toolkitLevel,
                    credits: data.credits,
                    stash: stash,
                    stats: stats,
                    loadout: loadout || undefined,
                    licenses: licenses || undefined,
                    blueprints: blueprints || undefined
                });
            }
        } catch (e: any) {
            if (e.code !== 404) {
                logger.warn("Appwrite", "Sync Down Failed:", e);
            }
        }
    }

    async uploadScore(score: number, currentStats: any) {
        if (!this.userId) return;

        logger.debug("Appwrite", `Attempting Score Sync: ${score}`);
        // In local Appwrite, we update the profile stats
        this.save({
            ...currentStats,
            totalKills: (currentStats.totalKills || 0) + (score > 100 ? 1 : 0),
        } as any);
    }

    // addInventory and generateGiftCode removed to maintain SSOT in InventoryService

    async bindEmail(email: string) {
        // Appwrite email verification/binding is different from Supabase update
        // Usually involves createVerification
        try {
            // Simplified for now: just log
            logger.info("Appwrite", `Binding email requested: ${email}`);
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
                logger.info("Appwrite", "Magic URL Session Verified");
                await this.initCloudSync();
                return true;
            } catch (e: any) {
                logger.error("Appwrite", "Magic URL Verification Failed", e);
            }
        }

        if (this.isOffline) return false;

        const connected = await this.ensureConnection();
        if (!connected) return false;

        try {
            // Re-sync if we have a userId now
            if (this.userId) {
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
