import { persistence, UserProfile } from './PersistenceService';
import { inventoryService } from './InventoryService';
import { metaGame, MetaGameState } from './MetaGameService';
import { EventBus } from './EventBus';

export type AppState = 'BOOT' | 'MAIN_MENU' | 'HIDEOUT' | 'COMBAT' | 'GAME_OVER' | 'TUTORIAL_DEBRIEF';

// [NEW] Workbench Focus State
export type WorkbenchView = 'NONE' | 'CRATE' | 'HERO' | 'DEPLOY' | 'BLUEPRINTS';

interface SessionState {
    appState: AppState;
    profile: UserProfile;
    metaState: MetaGameState;
    workbenchView: WorkbenchView; // [NEW] Bridge to Phaser Camera
    sessionLoot: number; // [NEW] Gold gathered in current run
}

class SessionService {
    private state: SessionState;
    private listeners: ((state: SessionState) => void)[] = [];

    constructor() {
        this.state = {
            appState: 'BOOT',
            profile: persistence.getProfile(),
            metaState: metaGame.getState(),
            workbenchView: 'NONE',
            sessionLoot: 0 // [NEW] Track In-Game Loot
        };

        // Bind Context
        this.handleMetaUpdate = this.handleMetaUpdate.bind(this);
        this.handleMissionEnd = this.handleMissionEnd.bind(this);
        this.handleExtraction = this.handleExtraction.bind(this);
    }

    // --- Initialization ---
    public async init() {
        // [FIX] Register Critical Listeners EARLY (Before Async)
        EventBus.on('BOOT_COMPLETE', () => {
            console.log("🔥 [Session] BOOT_COMPLETE received! Transitioning to MAIN_MENU.");
            this.updateState({ appState: 'MAIN_MENU' });
        });

        // [SYSTEM] 1. Auth Callback
        const restored = await persistence.handleAuthCallback();
        if (restored) {
            console.log("🔗 [Session] Neural Link Restored.");
            this.refreshProfile();
        }

        // [SYSTEM] 2. Inventory Schema Check
        const inv = inventoryService.getState();
        if (inv.loadout?.head === undefined) {
            console.warn("⚠️ [Session] Schema Mismatch, force saving...");
            persistence.save(inv as any);
        }

        // [SYSTEM] 3. MetaGame Subscription
        metaGame.subscribe(this.handleMetaUpdate);

        // [SYSTEM] 4. Gift Code Protocol
        this.checkGiftCode();

        // [SYSTEM] 5. Event Listeners (Runtime)
        EventBus.on('GAME_OVER', this.handleMissionEnd);
        EventBus.on('EXTRACTION_SUCCESS', this.handleExtraction);
        // [NEW] Loot Pickup
        EventBus.on('LOOT_PICKUP', this.handleLootPickup.bind(this));
        // [CRITICAL FIX] Reset session loot when starting a new match
        EventBus.on('START_MATCH', () => {
            this.updateState({ sessionLoot: 0 });
        });

        // [FIX] Listen for FTUE triggers
        EventBus.on('SHOW_CLASS_SELECTION', () => { /* Handled elsewhere? */ });

        // [NEW] Workbench Focus Listener
        EventBus.on('WORKBENCH_FOCUS', (view: WorkbenchView) => {
            console.log(`🎥 [Session] Workbench Focus: ${view}`);
            this.updateState({ workbenchView: view });
        });
    }

    private checkGiftCode() {
        const query = new URLSearchParams(window.location.search);
        const giftCode = query.get('gift');
        if (giftCode) {
            try {
                const weapon = JSON.parse(atob(giftCode));
                if (weapon && weapon.baseType) {
                    persistence.addInventory(weapon);
                    alert(`🎁 [System] Received: ${weapon.name}`);
                } else {
                    const res = persistence.importSaveString(giftCode);
                    alert(res.msg);
                }
                window.history.replaceState({}, document.title, window.location.pathname);
                this.refreshProfile();
            } catch (e) {
                console.error("Link Corrupted");
            }
        }
    }

    // --- State Updates ---
    private handleMetaUpdate(newState: MetaGameState) {
        // Sync Logic
        let nextAppState = this.state.appState;

        if (newState.currentScreen === 'GAME_LOOP') {
            if (this.state.appState !== 'COMBAT') {
                this.transitionToCombat(newState.selectedHeroId || 'SCAVENGER');
            }
            nextAppState = 'COMBAT';
        } else if (newState.currentScreen === 'HIDEOUT' || newState.currentScreen === 'ARSENAL') {
            nextAppState = 'HIDEOUT';
        } else if (newState.currentScreen === 'GAME_OVER') {
            nextAppState = 'GAME_OVER';
        }

        this.updateState({ metaState: newState, appState: nextAppState });
    }

    private transitionToCombat(heroId: string) {
        console.log("⚡ [Session] Combat Sequence Initiated.");

        // [ROBUST] Wait for Scene to be Ready (Register BEFORE starting scene)
        const onSceneReady = () => {
            console.log("⚡ [Session] MainScene Ready. Starting Match...");
            EventBus.emit('START_MATCH', { mode: 'SINGLE', hero: heroId });
            EventBus.off('SCENE_READY', onSceneReady);
        };

        // Listen for ready signal
        EventBus.on('SCENE_READY', onSceneReady);

        // [FIX] Direct Phaser Access (Bypass EventBus if possible)
        const game = (window as any).phaserGame;
        if (game) {
            console.log("🎮 [Session] Direct Scene Switch Triggered (MainScene).");
            game.scene.start('MainScene');
            game.scene.stop('WorkbenchScene');
        } else {
            console.warn("⚠️ [Session] Phaser Game not found on window. Using EventBus fallback.");
            EventBus.emit('SCENE_SWITCH', 'MainScene');
        }

        // [FALLBACK] Timeout in case event is missed (e.g. restart)
        setTimeout(() => {
            if (EventBus.listenerCount('SCENE_READY') > 0) {
                console.warn("⚠️ [Session] Scene Ready Timeout. Forcing Start...");
                EventBus.emit('START_MATCH', { mode: 'SINGLE', hero: heroId });
                EventBus.off('SCENE_READY', onSceneReady);
            }
        }, 2000);
    }

    private handleMissionEnd(data: any) {
        console.log("🏁 [Session] Mission Complete.", data);
        const currentProfile = persistence.getProfile();

        if (data && data.score !== undefined) {
            persistence.uploadScore(data.score, data.wave || 1, 0);

            // [FIX] Add Session Loot to Total Credits
            const sessionGold = this.state.sessionLoot || 0;
            const earn = Math.floor(data.score / 10) + sessionGold;

            persistence.save({
                credits: currentProfile.credits + earn,
                level: Math.max(currentProfile.level, data.level || 1)
            });
        }

        // Death Penalty (Only on failure)
        if (!data.success) {
            inventoryService.punishDeath('SCAVENGER');
        }

        // FTUE Check
        if (!currentProfile.hasPlayedOnce) {
            persistence.save({ hasPlayedOnce: true });
            this.updateState({ appState: 'TUTORIAL_DEBRIEF' });
        } else {
            this.updateState({ appState: 'GAME_OVER' });
        }

        this.refreshProfile();
    }

    private handleExtraction(loot: any[]) {
        this.updateState({ appState: 'GAME_OVER' });
    }

    private handleLootPickup(data: { value: number }) {
        const val = data.value || 0;
        const current = this.state.sessionLoot || 0;
        this.updateState({ sessionLoot: current + val });
        // Emit for HUD
    }

    // --- Actions (Called by UI) ---
    public setBootComplete() {
        this.updateState({ appState: 'MAIN_MENU' });
    }

    public enterHideout() {
        this.updateState({ appState: 'HIDEOUT' });
        this.refreshProfile();
        // [FIX] Ensure Phaser switches back to Workbench
        EventBus.emit('RETURN_TO_BASE');
    }

    public returnToMainMenu() {
        this.updateState({ appState: 'MAIN_MENU' });
    }

    public startMatch(role: string) {
        const step = inventoryService.getTutorialStep();
        metaGame.startMatch(); // Determines state -> 'GAME_LOOP'

        // FTUE Intercept
        setTimeout(() => {
            if (step === 'VOID') {
                EventBus.emit('SHOW_CLASS_SELECTION');
            } else if (step === 'TRIAL') {
                const trialClass = inventoryService.getTrialClass();
                EventBus.emit('START_MATCH', { mode: 'SINGLE', hero: trialClass || role });
            } else {
                EventBus.emit('START_MATCH', { mode: 'SINGLE', hero: role });
            }
        }, 100);
    }

    public dispose() {
        this.listeners = [];
        EventBus.off('GAME_OVER', this.handleMissionEnd);
        EventBus.off('EXTRACTION_SUCCESS', this.handleExtraction);
        EventBus.off('WORKBENCH_FOCUS');
        // metagame unsubscribe?
    }

    // --- Store Pattern ---
    public sellItem(uid: string) {
        // Wrapper for InventoryService
        const val = inventoryService.sellItem(uid);
        this.refreshProfile(); // Trigger UI Update
        return val;
    }

    public subscribe(cb: (s: SessionState) => void) {
        this.listeners.push(cb);
        cb(this.state); // Immediate trigger
        return () => { this.listeners = this.listeners.filter(l => l !== cb); };
    }

    public getState() { return this.state; }

    private refreshProfile() {
        this.updateState({ profile: persistence.getProfile() });
    }

    private updateState(partial: Partial<SessionState>) {
        this.state = { ...this.state, ...partial };
        this.listeners.forEach(cb => cb(this.state));
    }
}

export const sessionService = new SessionService();
