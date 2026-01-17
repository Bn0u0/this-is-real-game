import React, { useState, useEffect } from 'react';
import { EventBus } from '../../services/EventBus';
import { sessionService } from '../../services/SessionService';
import { metaGame } from '../../services/MetaGameService';
import { inventoryService } from '../../services/InventoryService';
import { CLASSES } from '../../game/phaser/factories/PlayerFactory';
import { PlayerClassID, EquipmentSlot, ItemInstance } from '../../types';

export const HeroStatsOverlay: React.FC = () => {
    const selectedClassId = metaGame.getState().selectedHeroId as PlayerClassID;
    const heroClass = CLASSES[selectedClassId];
    const [profile, setProfile] = useState(inventoryService.getState());

    useEffect(() => {
        return inventoryService.subscribe(setProfile);
    }, []);

    const handleSlotClick = (slot: EquipmentSlot) => {
        metaGame.navigateTo('ARSENAL');
        EventBus.emit('WORKBENCH_FOCUS', 'CRATE');
    };

    if (!heroClass) return null;

    const loadoutStats = inventoryService.calculateTotalStats(profile.loadout, selectedClassId);
    const finalHP = heroClass.stats.hp + loadoutStats.hpMax;
    const finalSpeed = heroClass.stats.speed + loadoutStats.speed;
    const finalAtk = heroClass.stats.atk + loadoutStats.damage;

    return (
        <div className="absolute inset-0 flex items-center justify-center p-4 z-50 pointer-events-auto">
            {/* Baba-style container */}
            <div className="baba-box p-6 w-full max-w-md">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 border-b-2 border-rust pb-3">
                    <h2 className="text-2xl text-rust uppercase tracking-widest">
                        // 裝備配置
                    </h2>
                    <span className="text-ash text-sm">點擊欄位</span>
                </div>

                {/* Character Stats Section */}
                <div className="baba-box-rust p-4 mb-6">
                    <div className="flex gap-4">
                        {/* Avatar Block */}
                        <div className="w-16 h-16 border-2 border-bone flex items-center justify-center bg-void">
                            <span className="text-3xl">🥔</span>
                        </div>

                        {/* Stats */}
                        <div className="flex-1 flex flex-col justify-center gap-1">
                            <div className="text-lg text-acid uppercase mb-1">
                                {heroClass.name} LV.{profile.toolkitLevel}
                            </div>
                            <StatRow label="HP" value={Math.floor(finalHP)} colorClass="stat-hp" />
                            <StatRow label="SPD" value={Math.floor(finalSpeed)} colorClass="stat-speed" />
                            <StatRow label="ATK" value={Math.floor(finalAtk)} colorClass="stat-atk" />
                        </div>
                    </div>
                </div>

                {/* Equipment Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <EquipSlot label="武器" slot="mainWeapon" item={profile.loadout.mainWeapon} onClick={handleSlotClick} highlight />
                    <EquipSlot label="頭部" slot="head" item={profile.loadout.head} onClick={handleSlotClick} />
                    <EquipSlot label="軀幹" slot="body" item={profile.loadout.body} onClick={handleSlotClick} />
                    <EquipSlot label="腿部" slot="legs" item={profile.loadout.legs} onClick={handleSlotClick} />
                    <EquipSlot label="腳部" slot="feet" item={profile.loadout.feet} onClick={handleSlotClick} />
                </div>

                {/* Close Button */}
                <button
                    onClick={() => sessionService.openWorkbench('NONE')}
                    className="baba-btn-ghost w-full py-3"
                >
                    [ 關閉 ]
                </button>
            </div>
        </div>
    );
};

const StatRow = ({ label, value, colorClass }: { label: string, value: string | number, colorClass: string }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-ash">{label}</span>
        <span className={colorClass}>{value}</span>
    </div>
);

const EquipSlot = ({ label, slot, item, onClick, highlight }: { label: string, slot: EquipmentSlot, item: ItemInstance | null, onClick: (s: EquipmentSlot) => void, highlight?: boolean }) => (
    <div
        onClick={() => onClick(slot)}
        className={`baba-slot aspect-square flex flex-col items-center justify-center p-2 cursor-pointer
            ${highlight ? 'baba-slot-highlight' : ''}
        `}
    >
        <div className="text-xs text-ash mb-1 uppercase">{label}</div>
        {item ? (
            <div className={`text-sm text-center leading-tight ${getRarityClass(item.rarity)}`}>
                {item.name}
            </div>
        ) : (
            <div className="text-2xl opacity-30">{getSlotIcon(slot)}</div>
        )}
        {highlight && !item && <div className="text-xs text-rad animate-pulse mt-1">必需</div>}
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

const getRarityClass = (rarity: string) => {
    switch (rarity) {
        case 'COMMON': return 'rarity-common';
        case 'UNCOMMON': return 'rarity-uncommon';
        case 'RARE': return 'rarity-rare';
        case 'EPIC': return 'rarity-epic';
        case 'LEGENDARY': return 'rarity-legendary';
        default: return 'text-bone';
    }
}
