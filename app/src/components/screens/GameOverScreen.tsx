import React, { useState, useEffect } from 'react';
import { metaGame } from '../../services/MetaGameService';
import { sessionService } from '../../services/SessionService';

export const GameOverScreen: React.FC = () => {
    const [result, setResult] = useState(sessionService.getState().lastMissionResult);

    useEffect(() => {
        const unsub = sessionService.subscribe(s => setResult(s.lastMissionResult));
        return unsub;
    }, []);

    const isSuccess = result?.success || false;
    const earn = result?.earn || 0;

    return (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/95 flex-col overflow-hidden pointer-events-auto z-[100] font-mono select-none p-4">

            {/* Background Glitch Layer */}
            <div className={`absolute inset-0 opacity-10 pointer-events-none ${isSuccess ? 'bg-amber-500/20' : 'bg-red-500/20'}`} />

            {/* Core Text */}
            <div className="z-10 text-center space-y-4">
                <div className={`border-b-4 pb-2 mb-4 inline-block ${isSuccess ? 'border-amber-500' : 'border-red-600'}`}>
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-[0.05em] sm:tracking-[0.1em] uppercase italic">
                        {isSuccess ? 'EXTRACTED' : 'UNIT LOST'}
                    </h1>
                </div>

                <div className={`text-xl md:text-2xl font-bold tracking-[0.3em] uppercase ${isSuccess ? 'text-amber-500' : 'text-red-500 animate-pulse'}`}>
                    {isSuccess ? '[ SIGNAL STABLE ]' : '[ SIGNAL LOST ]'}
                </div>

                {/* Session Results */}
                <div className="mt-4 sm:mt-8 bg-black/50 border border-white/10 p-4 sm:p-6 space-y-2 text-left w-full max-w-[300px]">
                    <div className="flex justify-between text-gray-400 text-xs">
                        <span>MISSION STATUS:</span>
                        <span className={isSuccess ? 'text-green-500' : 'text-red-500'}>
                            {isSuccess ? 'SUCCESS' : 'FAILED'}
                        </span>
                    </div>
                    <div className="flex justify-between text-white font-bold">
                        <span>CREDITS EARNED:</span>
                        <span className="text-amber-500">+{earn}</span>
                    </div>
                    {!isSuccess && (
                        <div className="text-[10px] text-red-400 mt-2 italic">
                            // DATA LOSS DETECTED: LOADOUT PERMANENTLY DELETED
                        </div>
                    )}
                </div>
            </div>

            {/* Action Area */}
            <div className="z-10 mt-8 sm:mt-12">
                <button
                    onClick={() => {
                        metaGame.navigateTo('HIDEOUT');
                        sessionService.enterHideout(); // [FIX] Trigger scene switch
                    }}
                    className={`group relative px-8 sm:px-12 py-4 sm:py-6 font-black tracking-widest transition-all duration-200 border-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]
                        ${isSuccess
                            ? 'bg-amber-600 hover:bg-amber-500 text-black border-transparent hover:border-white'
                            : 'bg-red-900/50 hover:bg-red-600 text-white border-red-500 hover:border-white'}`}
                >
                    <span className="relative text-lg sm:text-xl">
                        {isSuccess ? 'RETURN TO BASE' : 'REBOOT SYSTEM'}
                    </span>
                </button>
            </div>
        </div>
    );
};
