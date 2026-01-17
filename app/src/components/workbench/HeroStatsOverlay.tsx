import React, { useState, useEffect } from 'react';
import { EventBus } from '../../services/EventBus';
import { languageService } from '../../services/LanguageService';
import { metaGame } from '../../services/MetaGameService';
import { inventoryService } from '../../services/InventoryService';
import { CLASSES } from '../../game/phaser/factories/PlayerFactory';
import { PlayerClassID, EquipmentSlot, ItemInstance } from '../../types';

export const HeroStatsOverlay: React.FC = () => {
    const selectedClassId = metaGame.getState().selectedHeroId as PlayerClassID;
    const heroClass = CLASSES[selectedClassId];
    // Subscribe to inventory profile
    const [profile, setProfile] = useState(inventoryService.getState());

    useEffect(() => {
        return inventoryService.subscribe(setProfile);
    }, []);

    const handleSlotClick = (slot: EquipmentSlot) => {
        // Navigate to Arsenal with filter context (Future)
        // For MVP, just open Arsenal
        metaGame.navigateTo('ARSENAL');
        EventBus.emit('WORKBENCH_FOCUS', 'CRATE'); // Force switch view
    };

    if (!heroClass) return null;

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto">
            <div className="w-full max-w-4xl bg-gray-900 border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.2)] rounded-xl overflow-hidden animate-in zoom-in duration-300 flex flex-col md:flex-row">

                {/* LEFT: CHARACTER & STATS */}
                <div className="w-full md:w-1/3 bg-black/40 p-6 flex flex-col items-center border-r border-white/10">
                    <div className="w-32 h-32 rounded-full border-4 border-cyan-500/30 flex items-center justify-center text-6xl mb-4 bg-gradient-to-b from-cyan-900/50 to-transparent">
                        😎
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight mb-1">{heroClass.name}</h2>
                    <p className="text-cyan-500/70 text-xs font-mono tracking-widest uppercase mb-6">LV.{profile.toolkitLevel} SCAVENGER</p>

                    <div className="w-full space-y-3">
                        {/* Calculate Effective Stats */}
                        {(() => {
                            const loadoutStats = inventoryService.calculateTotalStats(profile.loadout, selectedClassId);
                            const finalHP = heroClass.stats.hp + loadoutStats.hpMax;
                            const finalSpeed = heroClass.stats.speed + loadoutStats.speed;
                            const finalAtk = heroClass.stats.atk + loadoutStats.damage;

                            return (
                                <>
                                    <StatRow label="HP" value={Math.floor(finalHP)} color="text-red-400" />
                                    <StatRow label="SPEED" value={Math.floor(finalSpeed)} color="text-blue-400" />
                                    <StatRow label="ATK" value={Math.floor(finalAtk)} color="text-amber-400" />
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* RIGHT: LOADOUT GRID */}
                <div className="w-full md:w-2/3 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-cyan-400 font-bold tracking-widest uppercase text-xl">
                            COMBAT LOADOUT // 裝備配置
                        </h3>
                        <div className="text-[10px] text-gray-500 font-mono">CLICK SLOT TO EQUIP</div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-auto">
                        <EquipSlot
                            label="MAIN WEAPON"
                            slot="mainWeapon"
                            item={profile.loadout.mainWeapon}
                            onClick={handleSlotClick}
                            highlight
                        />
                        <EquipSlot label="HEADGEAR" slot="head" item={profile.loadout.head} onClick={handleSlotClick} />
                        <EquipSlot label="BODY ARMOR" slot="body" item={profile.loadout.body} onClick={handleSlotClick} />
                        <EquipSlot label="LEG SYSTEM" slot="legs" item={profile.loadout.legs} onClick={handleSlotClick} />
                        <EquipSlot label="FOOTWEAR" slot="feet" item={profile.loadout.feet} onClick={handleSlotClick} />
                    </div>

                    <div className="mt-8 border-t border-white/10 pt-4 flex gap-4">
                        <button
                            onClick={() => EventBus.emit('WORKBENCH_ACTION', 'BACK')}
                            className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold transition-colors rounded uppercase tracking-widest text-sm"
                        >
                            [{languageService.t('BTN_CLOSE')}]
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatRow = ({ label, value, color }: { label: string, value: string | number, color: string }) => (
    <div className="flex justify-between items-center w-full bg-white/5 px-3 py-2 rounded">
        <span className="text-xs text-gray-500 font-bold tracking-wider">{label}</span>
        <span className={`font-mono font-bold ${color}`}>{value}</span>
    </div>
);

const EquipSlot = ({ label, slot, item, onClick, highlight }: { label: string, slot: EquipmentSlot, item: ItemInstance | null, onClick: (s: EquipmentSlot) => void, highlight?: boolean }) => (
    <div
        onClick={() => onClick(slot)}
        className={`aspect-square relative group cursor-pointer border-2 transition-all overflow-hidden flex flex-col
            ${highlight ? 'border-amber-500/50 hover:bg-amber-500/10' : 'border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5'}
            ${item ? 'bg-black/80' : 'bg-white/5'}
        `}
    >
        <div className="absolute top-2 left-2 text-[10px] text-gray-500 font-bold tracking-widest z-10">{label}</div>

        {item ? (
            <div className="flex-1 flex flex-col items-center justify-center p-2 relative z-0">
                <div className={`text-sm font-bold text-center leading-tight mb-1 ${getItemColor(item.rarity)}`}>
                    {item.name}
                </div>
                <div className="text-[10px] text-gray-400 font-mono">LV.1</div>
            </div>
        ) : (
            <div className="flex-1 flex items-center justify-center text-3xl opacity-20 group-hover:opacity-40 transition-opacity">
                {getSlotIcon(slot)}
            </div>
        )}

        {/* Hover Hint */}
        {highlight && !item && <div className="absolute bottom-2 right-2 text-[9px] text-amber-500 animate-pulse">REQUIRED</div>}
    </div>
);

const getSlotIcon = (slot: string) => {
    switch (slot) {
        case 'mainWeapon': return '🔫';
        case 'head': return '🪖';
        case 'body': return '🦺';
        case 'legs': return '👖';
        case 'feet': return '🥾';
        default: return '📦';
    }
}

const getItemColor = (rarity: string) => {
    switch (rarity) {
        case 'COMMON': return 'text-gray-300';
        case 'UNCOMMON': return 'text-green-400';
        case 'RARE': return 'text-blue-400';
        case 'EPIC': return 'text-purple-400';
        case 'LEGENDARY': return 'text-amber-400';
        default: return 'text-white';
    }
}
