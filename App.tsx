import React, { useState, useEffect } from 'react';
import './App.css';
import { PhaserGame } from './game/PhaserGame';
import { GameOverlay } from './components/GameOverlay';
import { Hideout } from './components/Hideout';
import { BootScreen } from './components/BootScreen';
import { MainMenu } from './components/MainMenu';
import { metaGame, MetaGameState } from './services/MetaGameService';
import { persistence, UserProfile } from './services/PersistenceService';
import { EventBus } from './services/EventBus';

// Application State Machine
type AppState = 'BOOT' | 'MAIN_MENU' | 'HIDEOUT' | 'COMBAT' | 'SUMMARY' | 'TUTORIAL_DEBRIEF';

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
            const currentProfile = persistence.getProfile();

            // FTUE Logic: If rookie, go to Tutorial Debrief
            if (!currentProfile.hasPlayedOnce) {
                persistence.save({ hasPlayedOnce: true });
                setAppState('TUTORIAL_DEBRIEF');
            } else {
                setAppState('SUMMARY');
            }
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
        // Go to Main Menu instead of Hideout
        setAppState('MAIN_MENU');
    };

    // Called from MainMenu
    const handleStartGame = (role: string) => {
        // Start Game
        metaGame.startMatch(); // Reset state
        setAppState('COMBAT');
        EventBus.emit('START_MATCH', { mode: 'SINGLE', hero: role });
    };

    // Called from Hideout -> Deploy
    const handleDeploy = () => {
        handleStartGame(profile.loadout.weapon);
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

            {/* State: MAIN_MENU (Instant Challenge) */}
            {appState === 'MAIN_MENU' && (
                <MainMenu onStartGame={handleStartGame} />
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

            {/* State: TUTORIAL DEBRIEF (Rookie End) */}
            {appState === 'TUTORIAL_DEBRIEF' && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in p-8 text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-[#00FFFF] mb-6">SIGNAL ESTABLISHED</h2>
                    <p className="text-gray-300 max-w-md mb-12 leading-relaxed tracking-wider">
                        戰鬥數據已上傳。<br />
                        指揮官權限已解鎖。<br />
                        歡迎來到 SYNAPSE 神經網絡。
                    </p>
                    <button className="hero-button" onClick={handleReturnToBase}>
                        進入基地
                    </button>
                </div>
            )}

            {/* State: SUMMARY (Veteran End) */}
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
