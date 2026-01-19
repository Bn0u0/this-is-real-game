import React, { useState } from 'react';
import { PhaserGameLab } from './PhaserGameLab.tsx';
import { ArtLabOverlay } from './ArtLabOverlay';

export const ArtLabApp: React.FC = () => {
    // Background Color State (Black by default)
    const [bgDark, setBgDark] = useState(true);

    return (
        <div className={`w-full h-full flex items-center justify-center ${bgDark ? 'bg-black' : 'bg-white'}`}>
            {/* 1. Phaser Container */}
            <div className="relative w-full h-full max-w-[1280px] aspect-video border border-gray-800 shadow-2xl overflow-hidden">
                <PhaserGameLab />

                {/* 2. Overlay */}
                <ArtLabOverlay />
            </div>

            {/* 3. Global Tools (Outside Canvas) */}
            <div className="fixed top-4 left-4 z-50 flex space-x-2">
                <button
                    onClick={() => setBgDark(!bgDark)}
                    className="px-3 py-1 bg-gray-800 text-white text-xs font-mono border border-gray-600 hover:bg-gray-700"
                >
                    {bgDark ? '☼ LIGHT' : '☾ DARK'}
                </button>
            </div>
        </div>
    );
};
