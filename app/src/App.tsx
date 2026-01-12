import React, { useState, useEffect } from 'react';
import './App.css';
import { PhaserGame } from './game/PhaserGame';
import { GameOverlay } from './components/GameOverlay';
import { VirtualJoystick } from './components/VirtualJoystick';
import { BootScreen } from './components/BootScreen';
import { HideoutScreen } from './components/screens/HideoutScreen';
import { ArsenalScreen } from './components/screens/ArsenalScreen';
import { ArsenalOverlay } from './components/workbench/ArsenalOverlay';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { HTML_LAYER } from './game/constants/Depth';
import { EventBus } from './services/EventBus';
import { sessionService, AppState } from './services/SessionService';

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
        <div className="w-full h-screen bg-gray-900 flex justify-center items-center overflow-hidden">
            {/* 
               [RESOLUTION STRATEGY]
               Desktop: Phone Simulator (Height-First, Locked Aspect Ratio, Max Width)
               Mobile: Full Screen (via CSS media queries implicitly handling resizing)
            */}
            <div
                className="relative h-full w-auto aspect-[9/19.5] max-w-[480px] bg-black shadow-2xl overflow-hidden pointer-events-none sm:rounded-[2rem] sm:border-8 sm:border-gray-800"
                style={{ maxHeight: '100vh' }}
            >
                {/* Background Effects */}
                <div className="scanlines" />
                <div className={`noise-overlay ${appState === 'BOOT' ? 'opacity-10' : 'opacity-5'}`} />

                {/* State: MAIN_MENU / HIDEOUT */}
                {(appState === 'MAIN_MENU' || appState === 'HIDEOUT') && (
                    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: HTML_LAYER.HUD }}>
                        {session.workbenchView === 'CRATE' && (
                            <ArsenalOverlay
                                currentWeapon={session.profile.loadout.mainWeapon}
                                inventory={session.profile.inventory}
                            />
                        )}
                    </div>
                )}

                {/* State: BOOT SCREEN */}
                {appState === 'BOOT' && (
                    <BootScreen onStart={() => EventBus.emit('BOOT_COMPLETE')} />
                )}

                {/* State: PHASER GAME LAYER */}
                <div
                    className={`absolute inset-0 transition-opacity duration-1000 ${['BOOT', 'MAIN_MENU', 'HIDEOUT', 'COMBAT'].includes(appState) ? 'opacity-100' : 'opacity-0'}`}
                    style={{ visibility: ['BOOT', 'MAIN_MENU', 'HIDEOUT', 'COMBAT'].includes(appState) ? 'visible' : 'hidden', zIndex: HTML_LAYER.PHASER_DOM }}
                >
                    <PhaserGame />

                    {appState === 'COMBAT' && (
                        <>
                            <div className="absolute inset-0" style={{ zIndex: HTML_LAYER.JOYSTICK }}>
                                <VirtualJoystick
                                    onMove={(x, y) => EventBus.emit('JOYSTICK_MOVE', { x, y })}
                                    onAim={(x, y, firing) => { /* Auto-aim handling */ }}
                                    onSkill={(skill) => {
                                        if (skill === 'DASH') EventBus.emit('TRIGGER_SKILL', 'dash');
                                        if (skill === 'Q') EventBus.emit('TRIGGER_SKILL', 'skill1');
                                        if (skill === 'E') EventBus.emit('TRIGGER_SKILL', 'skill2');
                                    }}
                                />
                            </div>

                            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: HTML_LAYER.HUD }}>
                                <GameOverlay />
                            </div>
                        </>
                    )}
                </div>

                {/* State: TUTORIAL DEBRIEF */}
                {appState === 'TUTORIAL_DEBRIEF' && (
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in p-8 text-center">
                        <h2 className="text-4xl md:text-6xl font-black text-[#00FFFF] mb-6">SIGNAL ESTABLISHED</h2>
                        <p className="text-gray-300 max-w-md mb-12 leading-relaxed tracking-wider">
                            戰鬥數據已上傳。<br />
                            指揮官權限已解鎖。<br />
                            歡迎來到 SYNAPSE 神經網絡。
                        </p>
                        <button
                            className="px-8 py-4 bg-[#00FFFF] text-black font-black tracking-widest text-xl uppercase skew-x-[-10deg] hover:bg-white hover:scale-105 transition-transform"
                            onClick={handleReturnToBase}
                        >
                            進入基地
                        </button>
                    </div>
                )}

                {/* State: GAME_OVER */}
                {appState === 'GAME_OVER' && <GameOverScreen />}
            </div>
        </div>
    );
};

export default App;
