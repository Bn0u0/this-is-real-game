import React, { useState, useEffect } from 'react';
import { EventBus } from '../../services/EventBus';
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
            {/* Hand-drawn paper card */}
            <div className="wobbly-box p-6 w-full max-w-md shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black" style={{ fontFamily: 'var(--font-marker)' }}>
                        裝備配置
                    </h2>
                    <span className="font-hand text-gray-500 text-sm">點擊裝備欄位</span>
                </div>

                {/* Character Profile Section */}
                <div className="flex gap-4 mb-6 p-4 bg-white/50 border-2 border-dashed border-gray-300 rounded-lg">
                    {/* Avatar */}
                    <div className="bg-white p-2 shadow-sm transform -rotate-2 shrink-0">
                        <div className="w-20 h-20 bg-gray-200 border border-gray-300 flex items-center justify-center">
                            <span className="text-4xl">🥔</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 flex flex-col justify-center gap-2">
                        <div className="tape-label px-3 py-1 inline-block transform rotate-1 mb-2">
                            <span className="font-bold">{heroClass.name}</span>
                            <span className="font-hand text-gray-600 ml-2">LV.{profile.toolkitLevel}</span>
                        </div>
                        <StatRow label="血量" value={Math.floor(finalHP)} color="text-red-600" />
                        <StatRow label="速度" value={Math.floor(finalSpeed)} color="text-blue-600" />
                        <StatRow label="攻擊" value={Math.floor(finalAtk)} color="text-amber-600" />
                    </div>
                </div>

                {/* Equipment Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <EquipSlot label="主武器" slot="mainWeapon" item={profile.loadout.mainWeapon} onClick={handleSlotClick} highlight />
                    <EquipSlot label="頭盔" slot="head" item={profile.loadout.head} onClick={handleSlotClick} />
                    <EquipSlot label="護甲" slot="body" item={profile.loadout.body} onClick={handleSlotClick} />
                    <EquipSlot label="腿部" slot="legs" item={profile.loadout.legs} onClick={handleSlotClick} />
                    <EquipSlot label="鞋子" slot="feet" item={profile.loadout.feet} onClick={handleSlotClick} />
                </div>

                {/* Close Button */}
                <button
                    onClick={() => EventBus.emit('WORKBENCH_ACTION', 'BACK')}
                    className="sketch-btn w-full py-3 bg-white text-black text-lg"
                >
                    關閉
                </button>
            </div>
        </div>
    );
};

const StatRow = ({ label, value, color }: { label: string, value: string | number, color: string }) => (
    <div className="flex justify-between items-center font-hand text-lg">
        <span className="text-gray-600">{label}</span>
        <span className={`font-bold ${color}`}>{value}</span>
    </div>
);

const EquipSlot = ({ label, slot, item, onClick, highlight }: { label: string, slot: EquipmentSlot, item: ItemInstance | null, onClick: (s: EquipmentSlot) => void, highlight?: boolean }) => (
    <div
        onClick={() => onClick(slot)}
        className={`aspect-square relative cursor-pointer border-2 transition-all flex flex-col items-center justify-center p-2 rounded-lg
            ${highlight ? 'border-amber-400 bg-amber-50' : 'border-gray-300 bg-white/70'}
            hover:scale-105 hover:shadow-md
        `}
    >
        <div className="text-xs font-hand text-gray-500 mb-1">{label}</div>
        {item ? (
            <>
                <div className={`text-sm font-bold text-center leading-tight ${getItemColor(item.rarity)}`}>
                    {item.name}
                </div>
            </>
        ) : (
            <div className="text-3xl opacity-30">{getSlotIcon(slot)}</div>
        )}
        {highlight && !item && <div className="text-xs text-amber-500 font-hand animate-pulse mt-1">必需</div>}
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
        case 'COMMON': return 'text-gray-600';
        case 'UNCOMMON': return 'text-green-600';
        case 'RARE': return 'text-blue-600';
        case 'EPIC': return 'text-purple-600';
        case 'LEGENDARY': return 'text-amber-600';
        default: return 'text-gray-800';
    }
}
