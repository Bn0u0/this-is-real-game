import React, { useState, useEffect } from 'react';
import './App.css';
import { PhaserGame } from '../game/PhaserGame';
import { BootScreen } from '../components/common/BootScreen';
import { CombatInterface } from '../components/combat/CombatInterface';
import { HideoutScreen } from '../components/screens/HideoutScreen';
// import { ArsenalScreen } from '../components/screens/ArsenalScreen'; // DEAD
import { ArsenalOverlay } from '../components/workbench/ArsenalOverlay';
import { BlueprintOverlay } from '../components/workbench/BlueprintOverlay';
import { HeroStatsOverlay } from '../components/workbench/HeroStatsOverlay';
import { GameOverScreen } from '../components/screens/GameOverScreen';
import { HTML_LAYER } from '../game/constants/Depth';
import { EventBus } from '../services/EventBus';
import { sessionService, AppState } from '../services/SessionService';
import { SceneMonitor } from '../components/common/SceneMonitor';

const App: React.FC = () => {
    // Single Source of Truth
    const [session, setSession] = useState(sessionService.getState());

    useEffect(() => {
        // 1. Initialize System
        sessionService.init();

        // 2. Subscribe to State Changes
        const unsubscribe = sessionService.subscribe((newState) => {
            console.log("🔄 [App] State Update:", newState.appState);
            setSession({ ...newState });
        });

        return () => {
            unsubscribe();
            sessionService.dispose();
        };
    }, []);

    const appState = session.appState;

    // --- Handlers (Proxy to Service) ---
    const handleBootComplete = () => sessionService.setBootComplete();
    const handleReturnToBase = () => sessionService.enterHideout();

    return (
        /* [APP STORE STRATEGY] Mobile-First, Desktop Phone Simulator */
        <div className="w-full h-screen bg-black flex justify-center items-center overflow-hidden">
            {/* 
               The Phone Frame:
               - Mobile: Fills screen (handled by Tailwind breakpoints)
               - Desktop: Centered, max-width 430px (iPhone 14 Pro Max width)
            */}
            <div
                className="relative w-full h-full sm:max-w-[430px] sm:aspect-[9/19.5] sm:h-auto sm:max-h-full bg-transparent overflow-hidden"
            >
                {/* All UI layers sit inside this phone frame */}

                {/* State: MAIN_MENU / HIDEOUT */}
                {(appState === 'MAIN_MENU' || appState === 'HIDEOUT') && (
                    <div className="absolute inset-0 pointer-events-auto" style={{ zIndex: HTML_LAYER.HUD }}>
                        {/* Always show Main HUD when in Menu/Hideout */}
                        <HideoutScreen />

                        {session.workbenchView === 'CRATE' && (
                            <ArsenalOverlay
                                currentWeapon={session.profile.loadout.mainWeapon}
                                inventory={session.profile.stash}
                            />
                        )}
                        {session.workbenchView === 'BLUEPRINTS' && <BlueprintOverlay />}
                        {session.workbenchView === 'HERO' && <HeroStatsOverlay />}
                        {session.workbenchView === 'WORKBENCH' && (
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <div className="wobbly-box p-6 w-full max-w-sm pointer-events-auto shadow-lg">
                                    <h3 className="text-2xl font-bold text-center mb-4" style={{ fontFamily: 'var(--font-marker)' }}>
                                        工坊
                                    </h3>
                                    <p className="text-center mb-6 font-hand text-lg text-gray-600">
                                        升級系統初始化中...
                                    </p>
                                    <button
                                        className="sketch-btn w-full py-3 bg-white text-black"
                                        onClick={() => EventBus.emit('WORKBENCH_ACTION', 'BACK')}
                                    >
                                        返回
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* State: BOOT SCREEN */}
                {appState === 'BOOT' && (
                    <BootScreen onStart={() => EventBus.emit('BOOT_COMPLETE')} />
                )}

                {/* State: PHASER GAME LAYER */}
                <div
                    className={`absolute inset-0 ${['BOOT', 'MAIN_MENU', 'HIDEOUT', 'COMBAT'].includes(appState) ? 'opacity-100' : 'opacity-0'}`}
                    style={{ visibility: ['BOOT', 'MAIN_MENU', 'HIDEOUT', 'COMBAT'].includes(appState) ? 'visible' : 'hidden', zIndex: HTML_LAYER.PHASER_DOM }}
                >
                    <PhaserGame />

                    {appState === 'COMBAT' && (
                        <CombatInterface />
                    )}
                </div>

                {appState === 'TUTORIAL_DEBRIEF' && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
                        <div className="wobbly-box p-8 text-center max-w-sm shadow-xl">
                            <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'var(--font-marker)' }}>任務完成</h2>
                            <p className="font-hand text-xl text-gray-600 mb-8 leading-relaxed">
                                戰鬥數據已上傳。<br />
                                指揮官權限已解鎖。<br />
                                歡迎，拾荒者。
                            </p>
                            <button
                                className="sketch-btn px-6 py-4 text-xl"
                                onClick={handleReturnToBase}
                            >
                                進入基地
                            </button>
                        </div>
                    </div>
                )}

                {/* State: GAME_OVER */}
                {appState === 'GAME_OVER' && <GameOverScreen />}

                {/* DEV TOOLS */}
                <SceneMonitor />
            </div>
        </div>
    );
};

export default App;
