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

            {/* === HEADER ROW (Profile + System) === */}
            <div className="w-full flex justify-between items-start pointer-events-none">

                {/* TOP LEFT: PROFILE */}
                <div className="pointer-events-auto flex items-center gap-3">
                    {/* Avatar Box */}
                    <div className="w-12 h-12 bg-black/80 border border-amber-500/30 flex items-center justify-center overflow-hidden">
                        <span className="text-xl">😎</span>
                    </div>

                    {/* Info Text */}
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-lg font-bold text-white tracking-wider">
                                {t('ROOT_ACCESS').replace('// ', '')} 8842
                            </h2>
                            <span className="text-xs text-amber-500 font-mono bg-amber-500/10 px-1 rounded">
                                LV.{profile.toolkitLevel || 1}
                            </span>
                        </div>
                    </div>
                </div>

                {/* TOP RIGHT: UTILITY STACK */}
                <div className="flex flex-col items-end gap-2 pointer-events-auto">
                    {/* Currencies */}
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-amber-500 font-mono text-base">{profile.wallet?.gold || 0}</span>
                            <div className="w-2 h-2 bg-amber-500 rounded-full" title={t('CREDITS')} />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-cyan-400 font-mono text-sm">{profile.wallet?.gems || 0}</span>
                            <div className="w-1.5 h-1.5 bg-cyan-400 rotate-45" title={t('SHARDS')} />
                        </div>
                    </div>

                    {/* System Menu (Moved from Bottom Left) */}
                    <div className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                        <button className="p-1 text-white/30 hover:text-white transition-colors">
                            <span className="text-lg">⚙️</span>
                        </button>
                        <button className="p-1 text-white/30 hover:text-white transition-colors">
                            <span className="text-lg">✉️</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* === BOTTOM LEFT: CLASS SELECTION === */}
            <div className="pointer-events-auto absolute bottom-6 left-6 flex flex-col gap-2">
                <div className="text-xs text-white/50 font-mono mb-1">// SELECT CLASS</div>
                {(['SCAVENGER', 'SKIRMISHER', 'WEAVER'] as PlayerClassID[]).map((classId) => (
                    <button
                        key={classId}
                        onClick={() => metaGame.selectHero(classId)}
                        className={`px-4 py-2 border-2 font-bold text-sm transition-all
                            ${metaGame.getState().selectedHeroId === classId
                                ? 'bg-amber-500 border-amber-300 text-black'
                                : 'bg-black/50 border-white/20 text-white hover:border-amber-500/50'}`}
                    >
                        {classId === 'SCAVENGER' && '🛡️ 拾荒者'}
                        {classId === 'SKIRMISHER' && '🔫 游擊者'}
                        {classId === 'WEAVER' && '🤖 織命者'}
                    </button>
                ))}
            </div>

            {/* === BOTTOM RIGHT: DEPLOY (Restored) === */}
            {/* Only show when NO overlay is open (Immersive Mode) */}
            <div className="pointer-events-auto">
                <button
                    onClick={() => metaGame.startMatch()}
                    className="absolute bottom-6 right-6 group bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all"
                >
                    {/* Yellow Block (Flat) */}
                    <div className="px-12 py-6 flex items-center gap-4 border-2 border-white/20">
                        <span className="text-4xl font-black text-black tracking-widest italic">
                            {t('WB_GO')}
                        </span>
                        <span className="text-2xl animate-pulse delay-75 text-black/50">
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
