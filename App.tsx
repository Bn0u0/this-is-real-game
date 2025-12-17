import React, { useState, useEffect } from 'react';
import './App.css';
import { PhaserGame } from './game/PhaserGame';
import { GameOverlay } from './components/GameOverlay';
import { Hideout } from './components/Hideout';
import { BootScreen } from './components/BootScreen';
import { metaGame, MetaGameState } from './services/MetaGameService';
import { persistence, UserProfile } from './services/PersistenceService';
import { EventBus } from './services/EventBus';

// Application State Machine
type AppState = 'BOOT' | 'HIDEOUT' | 'COMBAT' | 'SUMMARY';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('BOOT');
    const [profile, setProfile] = useState<UserProfile>(persistence.getProfile());

    // Subscribe to MetaGame for Game Loop updates (Score, Waves, etc)
    const [metaState, setMetaState] = useState<MetaGameState>(metaGame.getState());

    useEffect(() => {
        const unsubscribe = metaGame.subscribe((newState: MetaGameState) => {
            setMetaState({ ...newState });
        });

        // Listen for Game Over / Extraction to return to Hideout
        const onMissionEnd = (data: any) => {
            // Update Profile
            if (data.type === 'GAME_OVER') {
                // Logic handled in MetaGame or here? 
                // Let's assume MetaGame handles logic, we just route.
            }
            setAppState('SUMMARY');
        };

        const onExtraction = (loot: any[]) => {
            setAppState('SUMMARY');
        };

        EventBus.on('GAME_OVER', onMissionEnd);
        EventBus.on('EXTRACTION_SUCCESS', onExtraction);

        return () => {
            unsubscribe();
            EventBus.off('GAME_OVER', onMissionEnd);
            EventBus.off('EXTRACTION_SUCCESS', onExtraction);
        };
    }, []);

    // Actions
    const handleBootComplete = () => {
        // Play SFX?
        setAppState('HIDEOUT');
    };

    const handleDeploy = () => {
        // Start Game
        metaGame.startMatch(); // Reset state
        setAppState('COMBAT');
        EventBus.emit('START_MATCH', 'SINGLE');
    };

    const handleReturnToBase = () => {
        // Reload profile in case it changed
        setProfile(persistence.getProfile());
        setAppState('HIDEOUT');
    };

    return (
        <div className="app-container relative w-full h-full overflow-hidden">
            {/* Background Effects */}
            <div className="scanlines" />
            <div className={`noise-overlay ${appState === 'BOOT' ? 'opacity-10' : 'opacity-5'}`} />

            {/* State: BOOT */}
            {appState === 'BOOT' && (
                <BootScreen onStart={handleBootComplete} />
            )}

            {/* State: HIDEOUT */}
            {appState === 'HIDEOUT' && (
                <div className="absolute inset-0 z-20 bg-[var(--hld-bg)]">
                    <Hideout profile={profile} onDeploy={handleDeploy} />
                </div>
            )}

            {/* State: COMBAT (Phaser Persistent) */}
            <div
                className={`absolute inset-0 transition-opacity duration-1000 ${appState === 'COMBAT' ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}
                style={{ visibility: appState === 'COMBAT' ? 'visible' : 'hidden' }}
            >
                <PhaserGame />
                {appState === 'COMBAT' && <GameOverlay />}
            </div>

            {/* State: SUMMARY (Overlay on top of Game) */}
            {appState === 'SUMMARY' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card max-w-md w-full text-center border-[#FF0055]">
                        <h2 className="text-4xl font-black text-[#FF0055] mb-4 tracking-widest">MISSION END</h2>
                        <div className="mb-8 text-gray-300">
                            SIGNAL LOST OR EXTRACTED
                        </div>
                        <button className="bubble-btn" onClick={handleReturnToBase}>
                            RETURN TO BASE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
