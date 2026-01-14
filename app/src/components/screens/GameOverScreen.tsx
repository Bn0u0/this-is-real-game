import React from 'react';
import { metaGame } from '../../services/MetaGameService';

// 未來可以在這裡加入：
// - 戰利品結算清單 (Lost Items)
// - 存活時間統計
// - 殺敵數統計
export const GameOverScreen: React.FC = () => {
    return (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/95 flex-col overflow-hidden pointer-events-auto z-[100] font-mono select-none">

            {/* Core Text */}
            <div className="z-10 text-center space-y-8">
                <div className="border-b-4 border-amber-500 pb-2 mb-8 inline-block">
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-[0.1em] uppercase">
                        KILLED
                    </h1>
                </div>

                <div className="text-xl md:text-2xl text-amber-500 font-bold tracking-[0.3em] uppercase">
                    [ SIGNAL LOST ]
                </div>

                <div className="text-sm text-gray-500 mt-4">
                    CONNECTION TERMINATED BY REMOTE HOST
                </div>
            </div>

            {/* Action Area */}
            <div className="z-10 mt-16">
                <button
                    onClick={() => metaGame.navigateTo('HIDEOUT')}
                    className="group relative px-12 py-6 bg-amber-600 hover:bg-amber-500 text-black font-black tracking-widest transition-all duration-200 border-2 border-transparent hover:border-white shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                    <span className="relative text-xl">REBOOT SYSTEM</span>
                </button>
            </div>
        </div>
    );
};
