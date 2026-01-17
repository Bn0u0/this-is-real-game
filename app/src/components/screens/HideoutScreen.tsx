import React, { useState, useEffect } from 'react';
import { metaGame } from '../../services/MetaGameService';
import { sessionService } from '../../services/SessionService';
import { inventoryService } from '../../services/InventoryService';
import { languageService } from '../../services/LanguageService';
import { PlayerClassID } from '../../types';

export const HideoutScreen: React.FC = () => {
    // 1. Data Subscriptions
    const [profile, setProfile] = useState(inventoryService.getState());
    const [langTick, setLangTick] = useState(0);

    useEffect(() => {
        const unsubInv = inventoryService.subscribe(setProfile);
        const unsubLang = languageService.subscribe(() => setLangTick(t => t + 1));
        return () => {
            unsubInv();
            unsubLang();
        };
    }, []);

    const t = (key: any) => languageService.t(key);

    return (
        /* [LAYOUT] Full-screen paper filling the phone frame */
        <div className="absolute inset-0 flex flex-col wobbly-box m-2 overflow-hidden">

            {/* === TOP SECTION: Header + Profile === */}
            <div className="p-4 pb-0">
                {/* Paper Title Bar */}
                <div className="flex items-center justify-between mb-4">
                    <div className="bg-[#F0E68C] px-4 py-2 transform -rotate-1 shadow-md wobbly-box">
                        <h1 className="text-2xl font-black tracking-wider text-[#2A2A2A]" style={{ fontFamily: 'var(--font-marker)' }}>
                            任務簡報
                        </h1>
                    </div>
                    {/* Decorative Clip */}
                    <div className="w-3 h-10 bg-gray-400 rounded-full shadow-inner opacity-80 mr-4" />
                </div>

                {/* Agent Profile Row */}
                <div className="flex justify-between items-start gap-4">
                    {/* Photo (Polaroid) */}
                    <div className="bg-white p-2 shadow-sm transform -rotate-2 w-28 shrink-0">
                        <div className="w-full aspect-square bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden">
                            <span className="text-4xl">🥔</span>
                        </div>
                        <div className="text-center font-hand text-lg mt-1 text-gray-600">
                            #8842
                        </div>
                    </div>

                    {/* Stats Panel */}
                    <div className="flex flex-col items-end gap-2 flex-1">
                        <div className="tape-label py-2 px-3 text-lg transform rotate-1 shadow-sm">
                            <span className="font-bold">LV.{profile.toolkitLevel || 1} 拾荒者</span>
                        </div>
                        <div className="flex flex-col items-end gap-1 font-hand text-xl text-[#2A2A2A]">
                            <span>金幣: {profile.wallet?.gold || 0} G</span>
                            <span>寶石: {profile.wallet?.gems || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* === MIDDLE SECTION: Character Preview (Flexible Space) === */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full h-full border-dashed border-2 border-gray-300 rounded-lg flex items-center justify-center opacity-40">
                    <span className="font-hand text-3xl rotate-[-5deg] text-gray-500">[ 角色預覽區 ]</span>
                </div>
            </div>

            {/* === BOTTOM SECTION: Action Buttons === */}
            <div className="p-4 pt-0">
                <div className="flex justify-between items-end gap-4">
                    {/* Upgrade Button (Sticky Note) */}
                    <button
                        onClick={() => sessionService.openWorkbench('HERO')}
                        className="wobbly-box bg-[#E8E8C0] px-5 py-4 transform rotate-2 hover:rotate-0 transition-transform shadow-sm hover:shadow-md"
                    >
                        <span className="font-hand text-2xl font-bold block leading-none">裝備</span>
                        <span className="font-hand text-sm block leading-none text-gray-600 mt-1">強化</span>
                    </button>

                    {/* GO Button (Big Stamp) */}
                    <button
                        onClick={() => metaGame.startMatch()}
                        className="group flex-1 max-w-[200px]"
                    >
                        <div className="sketch-btn w-full px-6 py-5 bg-[#D32F2F] text-white flex items-center justify-center gap-3 transform -rotate-1 group-hover:scale-105 transition-transform shadow-lg">
                            <span className="text-3xl font-black" style={{ fontFamily: 'var(--font-marker)' }}>
                                出擊
                            </span>
                            <span className="text-2xl animate-pulse">!</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
