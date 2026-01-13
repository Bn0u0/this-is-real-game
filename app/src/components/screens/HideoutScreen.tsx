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
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 overflow-hidden">

            {/* === TOP LEFT: PROFILE (COMPACT) === */}
            <div className="pointer-events-auto flex items-center gap-3">
                {/* Avatar Box (Smaller) */}
                <div className="w-12 h-12 bg-black/80 border border-amber-500/30 flex items-center justify-center overflow-hidden">
                    <span className="text-xl">😎</span>
                </div>

                {/* Info Text (Compact) */}
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-lg font-bold text-white tracking-wider">
                            {t('ROOT_ACCESS').replace('// ', '')} 8842
                        </h2>
                        <span className="text-xs text-amber-500 font-mono bg-amber-500/10 px-1 rounded">
                            LV.{profile.level || 1}
                        </span>
                    </div>
                </div>
            </div>

            {/* === TOP RIGHT: CURRENCIES (Compact) === */}
            <div className="pointer-events-auto flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-mono text-base">{profile.wallet?.gold || 0}</span>
                    <div className="w-2 h-2 bg-amber-500 rounded-full" title={t('CREDITS')} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-mono text-sm">{profile.wallet?.gems || 0}</span>
                    <div className="w-1.5 h-1.5 bg-cyan-400 rotate-45" title={t('SHARDS')} />
                </div>
            </div>

            {/* === CENTER RIGHT: REMOVED (Immersive Mode) === */}
            {/* User Interaction relies on 3D Scene Clicks (Crate / Hero) */}

            {/* === BOTTOM LEFT: SYSTEM MENU (Subtle) === */}
            <div className="pointer-events-auto flex items-end gap-2 opacity-50 hover:opacity-100 transition-opacity">
                <button className="p-2 text-white/30 hover:text-white transition-colors">
                    <span className="text-xl">⚙️</span>
                </button>
                <button className="p-2 text-white/30 hover:text-white transition-colors">
                    <span className="text-xl">✉️</span>
                </button>
            </div>

            {/* === BOTTOM RIGHT: DEPLOY (Restored) === */}
            {/* Only show when NO overlay is open (Immersive Mode) */}
            <div className="pointer-events-auto">
                <button
                    onClick={() => metaGame.startMatch()}
                    className="absolute bottom-6 right-6 group bg-amber-500 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                    {/* Yellow Block */}
                    <div className="px-12 py-6 flex items-center gap-4 skew-x-[-12deg] shadow-[0_0_20px_rgba(245,158,11,0.5)] group-hover:shadow-[0_0_40px_rgba(245,158,11,0.8)] border-2 border-white/20">
                        <span className="text-4xl font-black text-black tracking-widest italic skew-x-[12deg]">
                            {t('WB_GO')}
                        </span>
                        <span className="text-2xl animate-pulse delay-75 skew-x-[12deg] text-black/50">
                            ►►
                        </span>
                    </div>
                </button>
            </div>

            {/* === DECORATIVE OVERLAY LINES === */}
            <div className="absolute inset-x-0 bottom-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        </div>
    );
};
