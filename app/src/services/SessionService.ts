import { persistence } from './PersistenceService';
import { inventoryService } from './InventoryService';
import { metaGame, MetaGameState } from './MetaGameService';
import { EventBus } from './EventBus';
import { PlayerProfile } from '../types';
import { logger } from './LoggerService';

export type AppState = 'BOOT' | 'MAIN_MENU' | 'HIDEOUT' | 'COMBAT' | 'GAME_OVER' | 'TUTORIAL_DEBRIEF' | 'ART_LAB';

// [NEW] Workbench Focus State
export type WorkbenchView = 'NONE' | 'CRATE' | 'HERO' | 'DEPLOY' | 'BLUEPRINTS' | 'WORKBENCH';

interface SessionState {
    appState: AppState;
    profile: PlayerProfile;
    metaState: MetaGameState;
    workbenchView: WorkbenchView;
    sessionLoot: number;
    lastMissionResult?: {
        success: boolean;
        earn: number;
        lootCount: number;
    };
}

class SessionService {
    private state: SessionState;
    private listeners: ((state: SessionState) => void)[] = [];
    private sceneReadyHandled: boolean = false; // [FIX] Prevent double START_MATCH

    constructor() {
        this.state = {
            appState: 'BOOT',
            profile: inventoryService.getState(),
            metaState: metaGame.getState(),
            workbenchView: 'NONE',
            sessionLoot: 0
        };

        // Bind Context
        this.handleMetaUpdate = this.handleMetaUpdate.bind(this);
        this.handleMissionEnd = this.handleMissionEnd.bind(this);
        this.handleExtraction = this.handleExtraction.bind(this);
        this.handleLootPickup = this.handleLootPickup.bind(this); // [FIX] Bind for proper removal
        this.handleStartMatchReset = this.handleStartMatchReset.bind(this); // [FIX] Bind
    }

    private handleStartMatchReset() {
        this.updateState({ sessionLoot: 0 });
        this.sceneReadyHandled = false; // Reset flag for next match
    }

    // --- Initialization ---
    public async init() {
        // [FIX] Register Critical Listeners EARLY (Before Async)
        EventBus.on('BOOT_COMPLETE', () => {
            logger.info("Session", "BOOT_COMPLETE received! Transitioning to MAIN_MENU.");
            this.updateState({ appState: 'MAIN_MENU' });
        });

        // [SYSTEM] 1. Auth Callback
        const restored = await persistence.handleAuthCallback();
        if (restored) {
            logger.info("Session", "Neural Link Restored.");
            this.refreshProfile();
        }

        // [SYSTEM] 2. Inventory Subscription (SSOT)
        inventoryService.subscribe(newProfile => {
            this.updateState({ profile: newProfile });
        });

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
        EventBus.on('START_MATCH', this.handleStartMatchReset);

        // [REMOVED] Empty SHOW_CLASS_SELECTION listener was causing confusion

        // [NEW] Workbench Focus Listener
        EventBus.on('WORKBENCH_FOCUS', (view: WorkbenchView) => {
            logger.debug("Session", `Workbench Focus: ${view}`);
            this.updateState({ workbenchView: view });
        });
    }

    private checkGiftCode() {
        const query = new URLSearchParams(window.location.search);
        const giftCode = query.get('gift');
        if (giftCode) {
            try {
                const weapon = JSON.parse(atob(giftCode));
                if (weapon && weapon.defId) {
                    inventoryService.addItemToStash(weapon.defId);
                    alert(`🎁 [System] Received Artifact Seed.`);
                }
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e: any) {
                logger.error("Session", "Link Corrupted", e);
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
        logger.info("Session", "Combat Sequence Initiated.");
        this.sceneReadyHandled = false; // [FIX] Reset flag

        // [ROBUST] Wait for Scene to be Ready (Register BEFORE starting scene)
        const onSceneReady = () => {
            if (this.sceneReadyHandled) return; // [FIX] Prevent double trigger
            this.sceneReadyHandled = true;
            logger.info("Session", "MainScene Ready. Starting Match...");
            EventBus.emit('START_MATCH', { mode: 'SINGLE', hero: heroId });
            EventBus.off('SCENE_READY', onSceneReady);
        };

        // Listen for ready signal
        EventBus.on('SCENE_READY', onSceneReady);

        // [FIX] Direct Phaser Access (Bypass EventBus if possible)
        const game = (window as any).phaserGame;
        if (game) {
            const mainScene = game.scene.getScene('MainScene');
            if (mainScene && game.scene.isActive('MainScene')) {
                logger.info("Session", "MainScene already active. Emitting START_MATCH directly.");
                EventBus.emit('START_MATCH', { mode: 'SINGLE', hero: heroId });
            } else {
                logger.info("Session", "Starting MainScene...");
                game.scene.start('MainScene');
                game.scene.stop('WorkbenchScene');
            }
        } else {
            logger.warn("Session", "Phaser Game not found on window. Using EventBus fallback.");
            EventBus.emit('SCENE_SWITCH', 'MainScene');
        }

        // [FALLBACK] Timeout in case event is missed (e.g. restart)
        setTimeout(() => {
            if (!this.sceneReadyHandled) { // [FIX] Check flag instead of listener count
                logger.warn("Session", "Scene Ready Timeout. Forcing Start...");
                this.sceneReadyHandled = true;
                EventBus.emit('START_MATCH', { mode: 'SINGLE', hero: heroId });
                EventBus.off('SCENE_READY', onSceneReady);
            }
        }, 2000);
    }

    private handleMissionEnd(data: any) {
        logger.info("Session", "Mission Complete.", data);
        const currentProfile = this.state.profile;

        if (data && data.score !== undefined) {
            persistence.uploadScore(data.score, currentProfile.stats);

            // [FIX] Add Session Loot to Total Credits
            const sessionGold = this.state.sessionLoot || 0;
            const earn = Math.floor(data.score / 10) + sessionGold;

            inventoryService.addCredits(earn);
            inventoryService.updateToolkitLevel(data.level || currentProfile.toolkitLevel);

            // [NEW] Store Result for UI
            this.updateState({
                lastMissionResult: {
                    success: !!data.success,
                    earn: earn,
                    lootCount: sessionGold > 0 ? Math.floor(sessionGold / 10) : 0
                }
            });
        }

        // Death Penalty (Only on failure)
        if (!data.success) {
            inventoryService.punishDeath(currentProfile.id); // [FIX] Pass correct ID
        }

        // FTUE Check
        if (!currentProfile.hasPlayedOnce) {
            inventoryService.setPlayedOnce();
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

    // [NEW] Open workbench view from HideoutScreen buttons
    public openWorkbench(view: WorkbenchView) {
        logger.debug("Session", `Opening Workbench: ${view}`);
        this.updateState({ workbenchView: view });
    }

    public returnToMainMenu() {
        this.updateState({ appState: 'MAIN_MENU' });
    }

    public enterArtLab() {
        logger.info("Session", "Entering Art Lab Sandbox...");
        this.updateState({ appState: 'ART_LAB' });
        EventBus.emit('SCENE_SWITCH', 'ArtLabScene');
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
        // [FIX] Remove ALL registered EventBus listeners
        EventBus.off('BOOT_COMPLETE');
        EventBus.off('GAME_OVER', this.handleMissionEnd);
        EventBus.off('EXTRACTION_SUCCESS', this.handleExtraction);
        EventBus.off('LOOT_PICKUP', this.handleLootPickup);
        EventBus.off('START_MATCH', this.handleStartMatchReset);
        EventBus.off('WORKBENCH_FOCUS');
        // Note: metaGame and inventoryService subscriptions return unsubscribe functions,
        // but we currently don't store them. For a true cleanup, we should store and call them.
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
        this.updateState({ profile: inventoryService.getState() });
    }

    private updateState(partial: Partial<SessionState>) {
        this.state = { ...this.state, ...partial };
        this.listeners.forEach(cb => cb(this.state));
    }
}

export const sessionService = new SessionService();
