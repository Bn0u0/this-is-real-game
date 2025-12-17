import { inventoryService } from './InventoryService';
import { persistence } from './PersistenceService';
import { EventBus } from './EventBus';

export type GameScreen = 'HIDEOUT' | 'GAME_LOOP' | 'GAME_OVER';

export interface MetaGameState {
    currentScreen: GameScreen;
    selectedHeroId: string;
    isMobile: boolean;
}

class MetaGameService {
    private state: MetaGameState = {
        currentScreen: 'HIDEOUT', // Skip Boot/Menu, straight to Hideout
        selectedHeroId: 'Vanguard',
        isMobile: window.innerWidth < 768
    };

    constructor() {
        // Validation check
        this.init();
    }

    private init() {
        // Auto-load persistence
        const profile = persistence.getProfile();
        if (profile.level === 1 && profile.xp === 0) {
            console.log("New User / Default Profile Loaded");
        }

        // Mobile Check binding
        window.addEventListener('resize', () => {
            this.state.isMobile = window.innerWidth < 768;
            this.emitChange();
        });
    }

    // --- State Access ---
    public getState() {
        return this.state;
    }

    // --- Navigation Actions ---
    public navigateTo(screen: GameScreen) {
        console.log(`[MetaGame] Navigating to ${screen}`);
        this.state.currentScreen = screen;
        this.emitChange();
    }

    public selectHero(heroId: string) {
        this.state.selectedHeroId = heroId;
        this.emitChange();
    }

    // --- Game Logic Hooks ---
    public startMatch() {
        // Final check: Do we have energy? Do we have a loadout? 
        // For MVP2: Just go.
        this.navigateTo('GAME_LOOP');
        // Delay to allow React to mount Phaser
        setTimeout(() => {
            EventBus.emit('START_MATCH', {
                mode: 'SINGLE',
                hero: this.state.selectedHeroId,
                // Inject Loadout stats here later
            });
        }, 100);
    }

    public handleGameOver(score: number) {
        // 1. Save Highscore (Persistence) - Already done by App.tsx? Move it here.
        // 2. Clear temp inventory?

        // DEATH PENALTY LOGIC
        const lostItemName = inventoryService.punishDeath(this.state.selectedHeroId);
        if (lostItemName) {
            console.log(`[DEATH PENALTY] Hero died. Lost Item: ${lostItemName}`);
            // We should ideally pass this to the Game Over screen
        }

        this.navigateTo('GAME_OVER');
    }

    public handleExtractionSuccess(lootIds: string[]) {
        // 1. Convert loot to artifacts
        inventoryService.processExtractionLoot(lootIds);
        // 2. Return to Hideout to show loot
        this.navigateTo('HIDEOUT');
    }

    // --- React Subscription Helper ---
    // Simple observer pattern for App.tsx to redraw
    private listeners: Function[] = [];

    public subscribe(listener: Function) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private emitChange() {
        this.listeners.forEach(l => l(this.state));
    }
}

export const metaGame = new MetaGameService();
