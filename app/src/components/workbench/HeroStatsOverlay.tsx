import React from 'react';
import { EventBus } from '../../services/EventBus';
import { languageService } from '../../services/LanguageService';
import { metaGame } from '../../services/MetaGameService';
import { CLASSES } from '../../game/phaser/factories/PlayerFactory';
import { PlayerClassID } from '../../types';

export const HeroStatsOverlay: React.FC = () => {
    const selectedClassId = metaGame.getState().selectedHeroId as PlayerClassID;
    const heroClass = CLASSES[selectedClassId];

    if (!heroClass) return null;

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-sm z-50">
            <div className="w-full max-w-sm bg-gray-900 border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.2)] rounded-xl overflow-hidden animate-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-cyan-900/30 p-4 border-b border-cyan-500/30 flex justify-between items-center">
                    <h3 className="text-cyan-400 font-black tracking-widest uppercase">
                        {languageService.t('HERO_STATS_HEADER')}
                    </h3>
                    <div className="px-2 py-0.5 bg-cyan-500 text-black text-[10px] font-bold rounded">
                        LV.{heroClass.stats.speed > 300 ? 5 : 1}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Visual & Name */}
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-lg border-2 border-white/20 flex items-center justify-center text-3xl"
                            style={{ backgroundColor: `#${heroClass.stats.markColor.toString(16)}` }}
                        >
                            {selectedClassId === 'SCAVENGER' ? '🛡️' : selectedClassId === 'SKIRMISHER' ? '🔫' : '🧬'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">{heroClass.name}</h2>
                            <p className="text-cyan-500/70 text-xs font-mono tracking-tighter uppercase">ID: {selectedClassId}_PROTOTYPE</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <StatItem label={languageService.t('STAT_HP_MAX')} value={heroClass.stats.hp} color="text-red-400" />
                        <StatItem label={languageService.t('STAT_SPEED')} value={heroClass.stats.speed} color="text-blue-400" />
                        <StatItem label={languageService.t('STAT_DAMAGE')} value={heroClass.stats.atk} color="text-amber-400" />
                        <StatItem label="RANK" value={selectedClassId === 'SCAVENGER' ? 'ALPHA' : 'BETA'} color="text-purple-400" />
                    </div>

                    {/* Passive Status */}
                    <div className="bg-black/40 p-3 rounded border border-white/5">
                        <h4 className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-widest">Active Passive</h4>
                        <p className="text-xs text-gray-300 italic">
                            {selectedClassId === 'SCAVENGER'
                                ? "REINFORCED PLATING: Reduce impact damage by 15%."
                                : selectedClassId === 'SKIRMISHER'
                                    ? "QUICK RELOAD: Increased firing cadence by 10%."
                                    : "NANO-REGEN: Small HP refill on kill."}
                        </p>
                    </div>

                    <button
                        onClick={() => EventBus.emit('WORKBENCH_ACTION', 'BACK')}
                        className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black transition-colors rounded uppercase tracking-widest text-sm shadow-[0_4px_0_rgb(8,145,178)] active:translate-y-1 active:shadow-none"
                    >
                        [{languageService.t('BTN_CLOSE')}]
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatItem = ({ label, value, color }: { label: string, value: string | number, color: string }) => (
    <div className="bg-white/5 p-3 rounded border border-white/5 flex flex-col">
        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">{label}</span>
        <span className={`text-lg font-black ${color}`}>{value}</span>
    </div>
);
